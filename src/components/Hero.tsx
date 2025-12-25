import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onBookDemo: () => void;
  dashboardImage: string;
}

const Hero = ({ onBookDemo, dashboardImage }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/60 text-foreground mb-8 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-sm font-medium">Trusted by 50+ Investment Banks</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] leading-[1.05] tracking-tight mb-8 animate-fade-up delay-100">
              Automating{' '}
              <br className="hidden lg:block" />
              <span className="text-accent">Investment</span>
              <br className="hidden lg:block" />
              <span className="text-accent">Banking</span>{' '}
              <span className="text-foreground">&amp; M&amp;A</span>
              <br className="hidden lg:block" />
              <span className="text-foreground">workflows</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 animate-fade-up delay-200 leading-relaxed">
              End-to-end deal orchestration — automate scheduling, due diligence, pipeline analytics, and collaboration so your team moves faster with less risk.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up delay-300">
              <Button
                variant="outline"
                size="lg"
                onClick={onBookDemo}
                className="rounded-full border-foreground/20 px-8 py-6 font-medium text-foreground hover:bg-foreground/5 hover:border-foreground/40 group"
              >
                <Play className="mr-2 h-4 w-4" />
                Request a demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-8 lg:gap-0 mt-16 animate-fade-up delay-400">
              <div className="lg:pr-8 lg:border-r border-border/50">
                <div className="font-serif text-3xl lg:text-4xl font-bold text-foreground">35%</div>
                <div className="text-sm text-muted-foreground mt-1">Faster Deal Cycles</div>
              </div>
              <div className="lg:px-8 lg:border-r border-border/50">
                <div className="font-serif text-3xl lg:text-4xl font-bold text-foreground">$2.4B+</div>
                <div className="text-sm text-muted-foreground mt-1">Deals Managed</div>
              </div>
              <div className="lg:pl-8">
                <div className="font-serif text-3xl lg:text-4xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground mt-1">M&A Teams</div>
              </div>
            </div>
          </div>

          {/* Dashboard Image */}
          <div className="relative animate-fade-up delay-200">
            <div className="relative">
              {/* Dashboard image with perspective tilt */}
              <div 
                className="relative rounded-2xl overflow-hidden shadow-lift"
                style={{
                  transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
                }}
              >
                <img
                  src={dashboardImage}
                  alt="MergerFlow.ai dashboard showing deal pipeline analytics and scheduling interface"
                  className="w-full h-auto rounded-2xl border border-border/30"
                  loading="eager"
                />
              </div>
            </div>

            {/* Floating stat badge */}
            <div className="absolute -bottom-4 left-4 lg:left-8 bg-card rounded-xl px-5 py-4 shadow-medium border border-border/50 animate-fade-up delay-500">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-emerald-500">+47%</span>
                <div>
                  <div className="font-semibold text-foreground text-sm">Deal Velocity</div>
                  <div className="text-xs text-muted-foreground">vs. last quarter</div>
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
