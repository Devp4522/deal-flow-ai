import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onBookDemo: () => void;
  dashboardImage: string;
}

const Hero = ({ onBookDemo, dashboardImage }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background glow effect */}
      <div className="hero-glow" aria-hidden="true" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground mb-6 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium">Trusted by leading financial institutions</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight mb-6 animate-fade-up delay-100">
              Automating{' '}
              <span className="text-primary">Investment Banking</span> & M&A workflows using{' '}
              <span className="relative inline-block">
                multi-agent AI
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="hsl(var(--accent))" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 animate-fade-up delay-200">
              End-to-end deal orchestration — automate scheduling, due diligence, pipeline analytics, and collaboration so your team moves faster and with less risk.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up delay-300">
              <Button
                onClick={onBookDemo}
                size="lg"
                className="cta-primary text-base px-8 py-6 group"
              >
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="cta-outline text-base px-8 py-6 group"
                onClick={() => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="mr-2 h-5 w-5" />
                See it in action
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50 animate-fade-up delay-400">
              <div>
                <div className="font-serif text-3xl lg:text-4xl font-bold text-foreground">35%</div>
                <div className="text-sm text-muted-foreground mt-1">Faster deal cycles</div>
              </div>
              <div>
                <div className="font-serif text-3xl lg:text-4xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground mt-1">Enterprise clients</div>
              </div>
              <div>
                <div className="font-serif text-3xl lg:text-4xl font-bold text-foreground">$2B+</div>
                <div className="text-sm text-muted-foreground mt-1">Deals processed</div>
              </div>
            </div>
          </div>

          {/* Dashboard Image */}
          <div className="relative animate-fade-up delay-200">
            <div className="relative rounded-2xl overflow-hidden shadow-lift">
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" aria-hidden="true" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" aria-hidden="true" />
              
              <img
                src={dashboardImage}
                alt="MergerFlow.ai dashboard showing deal pipeline analytics and scheduling interface"
                className="w-full h-auto rounded-2xl border border-border/50 animate-float"
                loading="eager"
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-medium border border-border/50 animate-fade-up delay-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">SOC2 Certified</div>
                  <div className="text-xs text-muted-foreground">Enterprise-grade security</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
