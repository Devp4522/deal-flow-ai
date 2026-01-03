import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Zap, Loader2, ChevronDown, FileSearch, Shield, TrendingUp, Lightbulb, Calculator, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  onBookDemo: () => void;
}

const productItems = [
  {
    icon: FileSearch,
    title: 'Research Agents',
    description: 'AI-powered company analysis and briefs',
    href: '/research',
    isRoute: true,
  },
  {
    icon: Shield,
    title: 'AI Due Diligence Assist',
    description: 'Summarize documents and flag risks',
    href: '#pricing',
    isRoute: false,
  },
  {
    icon: TrendingUp,
    title: 'Financial Agent',
    description: 'Automated financial modeling',
    href: '#pricing',
    isRoute: false,
  },
  {
    icon: Lightbulb,
    title: 'Wall Street Insights',
    description: 'Curated research and market intelligence',
    href: '#pricing',
    isRoute: false,
  },
  {
    icon: Calculator,
    title: 'Valuation Agent',
    description: 'AI-driven valuation models',
    href: '#pricing',
    isRoute: false,
  },
  {
    icon: Handshake,
    title: 'Negotiation Agent',
    description: 'Deal structuring automation',
    href: '/negotiation',
    isRoute: true,
  },
];

const Navigation = ({ onBookDemo }: NavigationProps) => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Pricing', href: '#pricing' },
    { label: 'Docs', href: '#docs' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
    setIsProductsOpen(false);
  };

  const handleProductItemClick = (item: typeof productItems[0]) => {
    if (item.isRoute) {
      navigate(item.href);
    } else {
      scrollToSection(item.href);
    }
    setIsProductsOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-soft py-3'
          : 'bg-transparent py-5'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2" aria-label="MergerFlow.ai Home">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold text-xl text-foreground">
              MergerFlow<span className="text-accent">.ai</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Products Dropdown */}
            <div className="relative" ref={productsRef}>
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              >
                Product
                <ChevronDown className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProductsOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg p-2 animate-fade-in">
                  {productItems.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => handleProductItemClick(item)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <>
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {user.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log out'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/auth')}
                >
                  Log in
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full border-foreground/20"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4 pt-4">
              {/* Mobile Products Section */}
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium px-2">Product</p>
                {productItems.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => handleProductItemClick(item)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground hover:text-foreground font-medium">{item.title}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-border/50 pt-4">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.href)}
                    className="w-full text-muted-foreground hover:text-foreground transition-colors font-medium text-left py-2"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                ) : user ? (
                  <>
                    <span className="text-sm text-muted-foreground py-2">
                      {user.email}
                    </span>
                    <Button 
                      variant="ghost" 
                      className="justify-start rounded-full"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="justify-start rounded-full"
                      onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}
                    >
                      Log in
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start rounded-full"
                      onClick={() => { navigate('/auth?mode=signup'); setIsMobileMenuOpen(false); }}
                    >
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
