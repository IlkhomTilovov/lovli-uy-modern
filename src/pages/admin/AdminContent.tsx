import { useState, useEffect } from 'react';
import { useErp } from '@/contexts/ErpContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Image, FileText, Phone } from 'lucide-react';

const AdminContent = () => {
  const { siteContent, updateSiteContent } = useErp();
  const { toast } = useToast();

  const [homeBanner, setHomeBanner] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
  });

  const [aboutText, setAboutText] = useState({
    title: '',
    content: '',
  });

  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    const banner = siteContent.find(c => c.section === 'home_banner');
    const about = siteContent.find(c => c.section === 'about_text');
    const contact = siteContent.find(c => c.section === 'contact_info');

    if (banner) setHomeBanner(banner.data as typeof homeBanner);
    if (about) setAboutText(about.data as typeof aboutText);
    if (contact) setContactInfo(contact.data as typeof contactInfo);
  }, [siteContent]);

  const handleSaveBanner = () => {
    updateSiteContent('home_banner', homeBanner);
    toast({ title: 'Saqlandi', description: 'Banner ma\'lumotlari yangilandi' });
  };

  const handleSaveAbout = () => {
    updateSiteContent('about_text', aboutText);
    toast({ title: 'Saqlandi', description: 'Biz haqimizda bo\'limi yangilandi' });
  };

  const handleSaveContact = () => {
    updateSiteContent('contact_info', contactInfo);
    toast({ title: 'Saqlandi', description: 'Aloqa ma\'lumotlari yangilandi' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kontent boshqaruvi</h1>
          <p className="text-muted-foreground">Sayt kontentini tahrirlash</p>
        </div>

        <Tabs defaultValue="banner">
          <TabsList>
            <TabsTrigger value="banner" className="gap-2">
              <Image className="w-4 h-4" />
              Banner
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <FileText className="w-4 h-4" />
              Biz haqimizda
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Phone className="w-4 h-4" />
              Aloqa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="banner" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bosh sahifa banner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <Input 
                    value={homeBanner.title} 
                    onChange={(e) => setHomeBanner({ ...homeBanner, title: e.target.value })}
                    placeholder="Asosiy sarlavha"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qo'shimcha matn</Label>
                  <Textarea 
                    value={homeBanner.subtitle} 
                    onChange={(e) => setHomeBanner({ ...homeBanner, subtitle: e.target.value })}
                    placeholder="Banner tavsifi"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tugma matni</Label>
                  <Input 
                    value={homeBanner.buttonText} 
                    onChange={(e) => setHomeBanner({ ...homeBanner, buttonText: e.target.value })}
                    placeholder="Katalogni ko'rish"
                  />
                </div>
                <Button onClick={handleSaveBanner} className="gap-2">
                  <Save className="w-4 h-4" />
                  Saqlash
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Biz haqimizda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <Input 
                    value={aboutText.title} 
                    onChange={(e) => setAboutText({ ...aboutText, title: e.target.value })}
                    placeholder="Biz haqimizda"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Matn</Label>
                  <Textarea 
                    value={aboutText.content} 
                    onChange={(e) => setAboutText({ ...aboutText, content: e.target.value })}
                    placeholder="Kompaniya haqida ma'lumot..."
                    rows={6}
                  />
                </div>
                <Button onClick={handleSaveAbout} className="gap-2">
                  <Save className="w-4 h-4" />
                  Saqlash
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Aloqa ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input 
                    value={contactInfo.phone} 
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="+998 71 123 45 67"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={contactInfo.email} 
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="info@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Manzil</Label>
                  <Textarea 
                    value={contactInfo.address} 
                    onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                    placeholder="Toshkent shahri..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleSaveContact} className="gap-2">
                  <Save className="w-4 h-4" />
                  Saqlash
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
