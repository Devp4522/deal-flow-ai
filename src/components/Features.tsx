import { FileSearch, Shield, TrendingUp, Lightbulb, Calculator, Handshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from './AnimatedSection';

const features = [
  {
    icon: FileSearch,
    title: 'Research Agents',
    description: 'AI-powered company analysis and research briefs with comparable company identification.',
    color: 'bg-blue-50 text-blue-600',
    href: '/research',
    isResearch: true,
  },
  {
    icon: Shield,
    title: 'AI Due Diligence Assist',
    description: 'Multi-agent AI summarizes data-room documents, flags risk signals, and auto-creates diligence checklists.',
    color: 'bg-purple-50 text-purple-600',
    href: '#pricing',
    isResearch: false,
  },
  {
    icon: TrendingUp,
    title: 'Financial Agent',
    description: 'Automated financial modeling, projections, and scenario analysis for M&A transactions.',
    color: 'bg-green-50 text-green-600',
    href: '/financial-agent',
    isResearch: true,
  },
  {
    icon: Lightbulb,
    title: 'High Quality Wall Street Insights',
    description: 'Access curated research, market intelligence, and expert analysis from top analysts.',
    color: 'bg-amber-50 text-amber-600',
    href: '#pricing',
    isResearch: false,
  },
  {
    icon: Calculator,
    title: 'Valuation Agent',
    description: 'AI-driven valuation models using DCF, comparables, and precedent transactions.',
    color: 'bg-rose-50 text-rose-600',
    href: '#pricing',
    isResearch: false,
  },
  {
    icon: Handshake,
    title: 'Negotiation Agent',
    description: 'Intelligent negotiation support with term sheet analysis and deal structuring automation.',
    color: 'bg-cyan-50 text-cyan-600',
    href: '/negotiation',
    isResearch: true,
  },
];

interface FeaturesProps {
  screenshotImage: string;
}

const Features = ({ screenshotImage }: FeaturesProps) => {
  const navigate = useNavigate();

  const handleTryNow = (feature: typeof features[0]) => {
    if (feature.isResearch) {
      navigate('/research');
    } else {
      const pricingSection = document.querySelector('#pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="products" className="section-padding relative">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-accent font-medium text-sm uppercase tracking-wider mb-4">
            Product Features
          </span>
          <h2 className="font-serif text-3xl lg:text-5xl font-medium mb-6">
            Everything you need to close deals faster
          </h2>
          <p className="text-lg text-muted-foreground">
            Purpose-built tools that automate the repetitive work so your team can focus on what matters — winning deals.
          </p>
        </AnimatedSection>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <AnimatedSection key={feature.title} delay={index * 100}>
              <div className="card-feature group cursor-pointer h-full">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <button 
                  onClick={() => handleTryNow(feature)}
                  className="mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                >
                  Try now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Why MergerFlow Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center bg-muted/50 -mx-4 lg:-mx-8 px-4 lg:px-8 py-16 lg:py-24 rounded-3xl">
          <AnimatedSection className="relative order-2 lg:order-1">
            <div className="bg-[#1a1f2e] rounded-2xl p-3 shadow-xl">
              <img
                src={screenshotImage}
                alt="MergerFlow analytics dashboard showing deal pipeline and performance metrics"
                className="rounded-xl w-full"
                loading="lazy"
              />
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={200} className="space-y-8 order-1 lg:order-2">
            <div>
              <span className="text-sm text-accent uppercase tracking-[0.2em] font-medium">
                Why MergerFlow
              </span>
              <h3 className="font-serif text-3xl lg:text-5xl font-medium mt-4 leading-tight">
                Built for the way modern deal teams work
              </h3>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              From first pitch to close, MergerFlow.ai streamlines every stage of the M&A lifecycle with intelligent automation.
            </p>
            
            <ul className="space-y-4">
              {[
                'Multi-agent AI orchestrates complex deal workflows',
                'Real-time collaboration with version control',
                'Automated document analysis and risk flagging',
                'Customizable M&A playbooks and templates',
                'Enterprise-grade security with SOC2 compliance',
                'Seamless integration with your existing tools',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-foreground font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Features;
