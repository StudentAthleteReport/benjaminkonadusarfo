import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/profile", label: "Profile" },
  { path: "/film", label: "Film" },
  { path: "/stats", label: "Stats" },
  { path: "/academic", label: "Academic" },
  { path: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleDownloadPDF = () => {
    window.open(`${BACKEND_URL}/api/export/pdf`, "_blank");
  };

  return (
    <>
      <nav
        data-testid="main-navigation"
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300 ${
          isScrolled ? "top-2" : "top-4"
        }`}
      >
        <div className="glass rounded-full px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            data-testid="nav-logo"
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">MJ</span>
            </div>
            <span className="hidden sm:block font-['Barlow_Condensed'] font-bold text-lg uppercase tracking-wide text-white">
              Elite Recruit
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={`nav-link px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-[#007AFF]"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadPDF}
              data-testid="download-pdf-btn"
              className="text-[#A1A1AA] hover:text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Link to="/contact">
              <Button
                size="sm"
                data-testid="nav-contact-btn"
                className="btn-primary bg-[#007AFF] hover:bg-[#0062C4] text-white rounded-full px-6"
              >
                Contact
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            data-testid="mobile-menu-toggle"
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          data-testid="mobile-menu"
          className="fixed inset-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl pt-24 px-6 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
                className={`text-2xl font-['Barlow_Condensed'] font-bold uppercase animate-fade-in-up ${
                  location.pathname === link.path ? "text-[#007AFF]" : "text-white"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-6 animate-fade-in-up delay-300">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                data-testid="mobile-download-pdf-btn"
                className="w-full border-[#27272A] text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download Profile PDF
              </Button>
              <Link to="/contact" className="w-full">
                <Button
                  data-testid="mobile-contact-btn"
                  className="w-full btn-primary bg-[#007AFF] hover:bg-[#0062C4] text-white"
                >
                  Contact Coaches
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
