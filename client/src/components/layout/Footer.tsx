import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ShopEase</h3>
            <p className="text-slate-300 mb-4">Your one-stop destination for quality products at affordable prices.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-slate-300 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=new" className="text-slate-300 hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=featured" className="text-slate-300 hover:text-white transition-colors">
                  Featured
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=sale" className="text-slate-300 hover:text-white transition-colors">
                  Sale Items
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Help</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-slate-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-slate-300 hover:text-white transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-slate-300 hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-2 h-4 w-4" />
                <span>Bareilly, Uttar Pradesh, 243001</span>
              </li>
              <li className="flex items-start">
                <Phone className="mt-1 mr-2 h-4 w-4" />
                <span>+91 9999999999</span>
              </li>
              <li className="flex items-start">
                <Mail className="mt-1 mr-2 h-4 w-4" />
                <span>support@shopease.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
