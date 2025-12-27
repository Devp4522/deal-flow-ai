import { useState } from 'react';
import { Sparkles, Rocket, Award, Building2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from './AnimatedSection';

interface PricingProps {
  onBookDemo: () => void;
}

interface Feature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  icon: React.ElementType;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  description: string;
  features: Feature[];
  cta: string;
  popular: boolean;
  ctaAction: 'tryNow' | 'upgrade' | 'bookDemo';
}

const plans: Plan[] = [
  {
    name: 'Free',
    icon: Sparkles,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Get started with basic research capabilities.',
    features: [
      { text: '3 usage of research agent', included: true },
      { text: 'Access to basic brief & comps', included: true },
      { text: 'Financial agent', included: false },
      { text: 'Valuation agent', included: false },
      { text: 'Negotiation agent', included: false },
      { text: 'Watermark on exports', included: false },
    ],
    cta: 'Try Now',
    popular: false,
    ctaAction: 'tryNow',
  },
  {
    name: 'Startup',
    icon: Rocket,
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: 'For small teams running occasional deals.',
    features: [
      { text: '25 usage of research agent', included: true },
      { text: '10 usage of financial, valuation & negotiation agent', included: true },
      { text: 'Downloadable Excel & PDF', included: true },
      { text: 'No watermark', included: true },
      { text: '5 active deals', included: true },
      { text: '1 seat / up to 3 users', included: true },
      { text: 'Email support (3 business days)', included: true },
      { text: 'Calendar + Slack basic integrations', included: true },
    ],
    cta: 'Upgrade',
    popular: false,
    ctaAction: 'upgrade',
  },
  {
    name: 'Pro',
    icon: Award,
    monthlyPrice: 299,
    yearlyPrice: 239,
    description: 'For teams managing recurring deal flow & advanced analytics.',
    features: [
      { text: 'Everything in Startup, plus:', included: true },
      { text: '80 workflows/month (add purchased credits)', included: true },
      { text: 'Up to 10 users / role-based seats', included: true },
      { text: 'Full Excel models, DCF + sensitivity charts', included: true },
      { text: 'Pitchbook generator (PDF/PPTX)', included: true },
      { text: 'Negotiation simulator + templated LOI drafts', included: true },
      { text: 'Priority support (SLA 24 hours)', included: true },
      { text: 'Onboarding assistance (remote)', included: true },
      { text: 'Slack, GCalendar, Salesforce basic connector', included: true },
    ],
    cta: 'Upgrade',
    popular: true,
    ctaAction: 'upgrade',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    monthlyPrice: null,
    yearlyPrice: null,
    description: 'Custom SLAs, advanced integrations, dedicated onboarding.',
    features: [
      { text: 'Custom/unlimited workflows', included: true },
      { text: 'SSO, SAML, VPC or on-prem connector option', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Onboarding services', included: true },
      { text: 'SLA, uptime guarantees, dedicated CSM', included: true },
      { text: 'Audit packages, compliance assistance (SOC2)', included: true },
      { text: 'Custom models & templates', included: true },
      { text: 'Priority engineering support', included: true },
      { text: 'Custom data connectors', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
    ctaAction: 'bookDemo',
  },
];

const Pricing = ({ onBookDemo }: PricingProps) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const navigate = useNavigate();

  const handleCtaClick = (plan: Plan) => {
    if (plan.ctaAction === 'tryNow') {
      navigate('/research');
    } else if (plan.ctaAction === 'bookDemo') {
      onBookDemo();
    }
    // For 'upgrade', we could add payment flow later
  };

  return (
    <section id="pricing" className="section-padding">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-accent font-medium text-sm uppercase tracking-wider mb-4">
            Pricing
          </span>
          <h2 className="font-serif text-3xl lg:text-5xl font-medium mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the plan that fits your team's needs. Scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              aria-label="Toggle annual billing"
            />
            <span className={`font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 text-sm bg-accent/20 text-accent-foreground px-3 py-1 rounded-full font-medium">
                Save 20%
              </span>
            )}
          </div>
        </AnimatedSection>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
          {plans.map((plan, index) => {
            const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
            const isEnterprise = plan.name === 'Enterprise';

            return (
              <AnimatedSection key={plan.name} delay={index * 150}>
                <div
                  className={`card-pricing relative flex flex-col h-full ${
                    plan.popular ? 'ring-2 ring-accent lg:scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                      <plan.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-primary-foreground">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      {price !== null ? (
                        <>
                          <span className="font-serif text-4xl font-bold text-primary-foreground">
                            ${price}
                          </span>
                          <span className="text-primary-foreground/70">/ month</span>
                        </>
                      ) : (
                        <span className="font-serif text-3xl font-bold text-primary-foreground">
                          Custom
                        </span>
                      )}
                    </div>
                    {isAnnual && price !== null && price > 0 && (
                      <span className="text-sm text-primary-foreground/60">
                        billed annually
                      </span>
                    )}
                  </div>

                  <p className="text-primary-foreground/80 mb-6">
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-destructive/60 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-primary-foreground/90' : 'text-primary-foreground/50 line-through'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCtaClick(plan)}
                    className={`w-full rounded-full py-6 font-semibold ${
                      plan.popular
                        ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                        : 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                    }`}
                    aria-label={`${plan.cta} for ${plan.name} plan`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Additional CTA */}
        <AnimatedSection delay={500} className="text-center mt-12">
          <p className="text-muted-foreground">
            Not sure which plan?{' '}
            <button
              onClick={onBookDemo}
              className="text-primary font-medium hover:underline"
            >
              Request a personalized demo
            </button>
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Pricing;
