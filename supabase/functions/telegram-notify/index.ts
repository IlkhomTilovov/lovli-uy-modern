import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  product_title: string;
  quantity: number;
  price_at_moment: number;
  subtotal: number;
  image?: string;
}

interface OrderData {
  id: string;
  customer_name: string;
  phone: string;
  region: string;
  city: string;
  address: string;
  comment?: string;
  total_price: number;
  items: OrderItem[];
  created_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram configuration');
      return new Response(
        JSON.stringify({ error: 'Telegram configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const order: OrderData = await req.json();
    console.log('Received order for Telegram notification:', order);

    // Format order items
    const itemsList = order.items
      .map((item, index) => `${index + 1}. ${item.product_title} x${item.quantity} = ${item.subtotal.toLocaleString()} so'm`)
      .join('\n');

    // Format the message
    const message = `
🛒 *YANGI BUYURTMA!*

📋 *Buyurtma ID:* \`${order.id.slice(0, 8)}\`
📅 *Sana:* ${new Date(order.created_at).toLocaleString('uz-UZ')}

👤 *Mijoz:* ${order.customer_name}
📞 *Telefon:* ${order.phone}

📍 *Manzil:*
${order.region}, ${order.city}
${order.address}
${order.comment ? `\n💬 *Izoh:* ${order.comment}` : ''}

📦 *Mahsulotlar:*
${itemsList}

💰 *Jami:* ${order.total_price.toLocaleString()} so'm
`.trim();

    // Collect product images
    const productImages = order.items
      .filter(item => item.image && item.image.startsWith('http'))
      .map(item => item.image as string);

    console.log('Product images to send:', productImages);

    // If there are product images, send them as a media group first
    if (productImages.length > 0) {
      try {
        if (productImages.length === 1) {
          // Send single photo with caption
          const photoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
          const photoResponse = await fetch(photoUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              photo: productImages[0],
              caption: message,
              parse_mode: 'Markdown',
            }),
          });
          const photoResult = await photoResponse.json();
          console.log('Telegram photo response:', photoResult);
          
          return new Response(
            JSON.stringify({ success: true, message_id: photoResult.result?.message_id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Send multiple photos as media group
          const media = productImages.slice(0, 10).map((photo, index) => ({
            type: 'photo',
            media: photo,
            caption: index === 0 ? message : undefined,
            parse_mode: index === 0 ? 'Markdown' : undefined,
          }));

          const mediaGroupUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`;
          const mediaResponse = await fetch(mediaGroupUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              media: media,
            }),
          });
          const mediaResult = await mediaResponse.json();
          console.log('Telegram media group response:', mediaResult);

          if (mediaResult.ok) {
            return new Response(
              JSON.stringify({ success: true, message_id: mediaResult.result?.[0]?.message_id }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      } catch (imageError) {
        console.error('Error sending images, falling back to text:', imageError);
        // Fall through to send text message
      }
    }

    // Send text message (fallback or if no images)
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const telegramResult = await telegramResponse.json();
    console.log('Telegram API response:', telegramResult);

    if (!telegramResult.ok) {
      console.error('Telegram API error:', telegramResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send Telegram message', details: telegramResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message_id: telegramResult.result.message_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in telegram-notify function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
