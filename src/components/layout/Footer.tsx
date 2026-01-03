import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import esilvLogo from "@/assets/esilv-marketplace-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={esilvLogo} alt="ESILV" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The official ESILV student marketplace. Buy, sell, and exchange within our engineering community.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/esilv_paris" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/school/15142508/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com/esilvparis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://www.youtube.com/user/esilvparis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a 
                href="https://www.facebook.com/esilvparis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition-colors">Browse Products</Link></li>
              <li><Link to="/sell" className="hover:text-primary transition-colors">Sell an Item</Link></li>
              <li><Link to="/category/books" className="hover:text-primary transition-colors">Textbooks</Link></li>
              <li><Link to="/category/electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/category/books" className="hover:text-primary transition-colors">Books & Notes</Link></li>
              <li><Link to="/category/electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link to="/category/furniture" className="hover:text-primary transition-colors">Furniture</Link></li>
              <li><Link to="/category/clothing" className="hover:text-primary transition-colors">Clothing</Link></li>
              <li><Link to="/category/sports" className="hover:text-primary transition-colors">Sports Equipment</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/help#safety" className="hover:text-primary transition-colors">Safety Tips</Link></li>
              <li><a href="https://www.esilv.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">ESILV Website</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ESILV Marketplace. A project by ESILV students.</p>
          <p>
            Developed by{" "}
            <a 
              href="https://muhammadali.it.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Muhammad Ali
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}