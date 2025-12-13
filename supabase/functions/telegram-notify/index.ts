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

    // Send message to Telegram
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
