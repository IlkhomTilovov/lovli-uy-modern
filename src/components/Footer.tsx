import { Link } from "react-router-dom";
import { Phone, MapPin, Mail, Facebook, Instagram, Send, Youtube, MessageCircle } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Footer = () => {
  const { contact, social, footer } = useSiteContent();

  return (
    <footer className="bg-secondary border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">XM</span>
              </div>
              <span className="font-bold text-lg">{footer?.companyName || "Xojalik Mollari"}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              {footer?.description || "Sifatli va arzon xojalik mollari. Sizning uyingiz uchun eng yaxshi mahsulotlar."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Tezkor Linklar</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Bosh Sahifa
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Katalog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Biz Haqimizda
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Aloqa
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Aloqa</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm text-muted-foreground">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p>{contact?.phone || "+998 90 123 45 67"}</p>
                  {contact?.phone2 && <p>{contact.phone2}</p>}
                </div>
              </li>
              <li className="flex items-start space-x-3 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{contact?.address || "Toshkent sh., Chilonzor tumani"}</span>
              </li>
              <li className="flex items-start space-x-3 text-sm text-muted-foreground">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{contact?.email || "info@xojalikmollari.uz"}</span>
              </li>
            </ul>
          </div>

          {/* Working Hours & Social */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Ish Vaqti</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Dushanba - Juma: {contact?.workingHours?.weekdays || "9:00 - 18:00"}<br />
              Shanba: {contact?.workingHours?.saturday || "10:00 - 16:00"}<br />
              Yakshanba: {contact?.workingHours?.sunday || "Dam olish"}
            </p>
            <h4 className="font-semibold mb-3">Ijtimoiy Tarmoqlar</h4>
            <div className="flex space-x-3">
              {social?.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {social?.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {social?.telegram && (
                <a
                  href={social.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Send className="h-5 w-5" />
                </a>
              )}
              {social?.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {social?.whatsapp && (
                <a
                  href={`https://wa.me/${social.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-background rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{footer?.copyright || `© ${new Date().getFullYear()} Xojalik Mollari. Barcha huquqlar himoyalangan.`}</p>
        </div>
      </div>
    </footer>
  );
};
