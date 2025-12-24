import { useState } from 'react';
import { Rocket, Award, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface PricingProps {
  onBookDemo: () => void;
}

const plans = [
  {
    name: 'Startup',
    icon: Rocket,
    monthlyPrice: 99,
    yearlyPrice: 79,
    description: 'For small teams running occasional deals.',
    features: [
      'Core scheduling & analytics',
      'Up to 5 team members',
      '10 active deals',
      'Email support',
      'Basic integrations',
    ],
    cta: 'Upgrade',
    popular: false,
  },
  {
    name: 'Pro',
    icon: Award,
    monthlyPrice: 699,
    yearlyPrice: 559,
    description: 'For teams managing recurring deal flow & advanced analytics.',
    features: [
      'Everything in Startup, plus:',
      'Unlimited team members',
      'Unlimited active deals',
      'AI due diligence assist',
      'Advanced analytics & reporting',
      'Priority support',
      'Custom integrations',
    ],
    cta: 'Upgrade',
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    monthlyPrice: 9999,
    yearlyPrice: 7999,
    description: 'Custom SLAs, advanced integrations, dedicated onboarding.',
    features: [
      'Everything in Pro, plus:',
      'Dedicated account manager',
      'Custom SLA & uptime guarantee',
      'SSO & advanced security',
      'White-label options',
      'On-premise deployment option',
      'API access & custom development',
    ],
    cta: 'Book a Demo',
    popular: false,
  },
];

const Pricing = ({ onBookDemo }: PricingProps) => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="section-padding">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => {
            const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
            const isEnterprise = plan.name === 'Enterprise';

            return (
              <div
                key={plan.name}
                className={`card-pricing relative flex flex-col ${
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
                    <span className="font-serif text-4xl font-bold text-primary-foreground">
                      ${price.toLocaleString()}
                    </span>
                    <span className="text-primary-foreground/70">/ month</span>
                  </div>
                  {isAnnual && (
                    <span className="text-sm text-primary-foreground/60">
                      billed annually
                    </span>
                  )}
                </div>

                <p className="text-primary-foreground/80 mb-6">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-primary-foreground/90 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={isEnterprise ? onBookDemo : undefined}
                  className={`w-full rounded-full py-6 font-semibold ${
                    plan.popular
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                  }`}
                  aria-label={isEnterprise ? 'Book a demo for Enterprise plan' : `${plan.cta} to ${plan.name} plan`}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Not sure which plan?{' '}
            <button
              onClick={onBookDemo}
              className="text-primary font-medium hover:underline"
            >
              Request a personalized demo
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
