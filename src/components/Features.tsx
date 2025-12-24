import { Calendar, FileSearch, BarChart3, Shield, Users, Plug } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Automated Deal Scheduling',
    description: 'Auto-schedule meetings, reminders, and review cycles across stakeholders and time zones.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: FileSearch,
    title: 'AI Due Diligence Assist',
    description: 'Multi-agent AI summarizes data-room documents, flags risk signals, and auto-creates diligence checklists.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Live Pipeline Analytics',
    description: 'Real-time dashboards and forecasts to prioritize deals and track KPIs.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Shield,
    title: 'Secure Data Rooms & Audit Trails',
    description: 'Enterprise-grade encryption, permissions, and immutable logs for complete compliance.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Users,
    title: 'Collaboration & Workflow Templates',
    description: 'Pre-built M&A playbooks, comment threads, and versioned documents for seamless teamwork.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Plug,
    title: 'Integrations',
    description: 'Connect Slack, Google Calendar, Salesforce, DocuSign, and major data providers.',
    color: 'bg-cyan-50 text-cyan-600',
  },
];

interface FeaturesProps {
  screenshotImage: string;
}

const Features = ({ screenshotImage }: FeaturesProps) => {
  return (
    <section id="products" className="section-padding relative">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-accent font-medium text-sm uppercase tracking-wider mb-4">
            Product Features
          </span>
          <h2 className="font-serif text-3xl lg:text-5xl font-medium mb-6">
            Everything you need to close deals faster
          </h2>
          <p className="text-lg text-muted-foreground">
            Purpose-built tools that automate the repetitive work so your team can focus on what matters — winning deals.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-feature group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              <button className="mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
                Learn more
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Feature Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-accent/10 rounded-full blur-3xl" aria-hidden="true" />
            <img
              src={screenshotImage}
              alt="MergerFlow analytics dashboard showing deal pipeline and performance metrics"
              className="rounded-2xl shadow-medium border border-border/50 relative z-10"
              loading="lazy"
            />
          </div>
          
          <div className="space-y-6">
            <h3 className="font-serif text-2xl lg:text-4xl font-medium">
              AI-powered insights at every stage
            </h3>
            <p className="text-lg text-muted-foreground">
              Our multi-agent AI works across your entire deal lifecycle, providing intelligent automation and actionable insights.
            </p>
            
            <ul className="space-y-4">
              {[
                'Automatic document classification and summarization',
                'Risk scoring and anomaly detection across data rooms',
                'Predictive analytics for deal probability and timing',
                'Smart meeting scheduling that respects all time zones',
                'Automated compliance checks and audit trail generation',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
