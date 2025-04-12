import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Mail, PhoneCall } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/seekup-uploads/885d4a8e-416c-42af-8a1c-5823a1889941.png" 
                alt="SEEKUP Logo" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-600 mb-4">
              Empowering volunteer engagement for communities, LGUs, and NGOs. 
              Filipinos for Filipinos — Hand in Hand, Anytime, Anywhere.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-seekup-blue transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-seekup-blue transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-seekup-blue transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-seekup-blue transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Users */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Users</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register?type=volunteer" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  Volunteer Sign Up
                </Link>
              </li>
              <li>
                <Link to="/register?type=organization" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  Organization Registration
                </Link>
              </li>
              <li>
                <Link to="/register?type=sponsor" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  Become a Sponsor
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-600 hover:text-seekup-blue transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail size={18} className="text-seekup-blue mr-2 mt-0.5" />
                <span className="text-gray-600">contact@seekup.ph</span>
              </li>
              <li className="flex items-start">
                <PhoneCall size={18} className="text-seekup-blue mr-2 mt-0.5" />
                <span className="text-gray-600">+63 (2) 8123 4567</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} SEEKUP. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-600 hover:text-seekup-blue text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-seekup-blue text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-600 hover:text-seekup-blue text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
