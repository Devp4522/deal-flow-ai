import AnimatedSection from './AnimatedSection';

const partners = [
  { name: 'Goldman Sachs', logo: 'GS' },
  { name: 'Morgan Stanley', logo: 'MS' },
  { name: 'Blackstone', logo: 'BX' },
  { name: 'McKinsey', logo: 'Mc' },
  { name: 'KKR', logo: 'KKR' },
  { name: 'Bain Capital', logo: 'BC' },
];

const testimonials = [
  {
    quote: "MergerFlow cut our deal cycle by 35% and eliminated scheduling headaches. It's become indispensable to our M&A practice.",
    author: 'Priya Ramanathan',
    title: 'Director, M&A',
    company: 'Top Investment Bank',
    avatar: 'PR',
  },
  {
    quote: "AI summaries reduced due-diligence time by weeks. What used to take our analysts days now happens in hours.",
    author: 'Mark Lindberg',
    title: 'Partner',
    company: 'Leading Private Equity',
    avatar: 'ML',
  },
  {
    quote: "Secure, auditable and easy to integrate with our existing systems. The compliance team loves the immutable audit trails.",
    author: 'Sarah Kim',
    title: 'Head of Corporate Development',
    company: 'Fortune 500 Company',
    avatar: 'SK',
  },
];

const SocialProof = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Partner Logos */}
        <AnimatedSection className="text-center">
          <span className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-medium">
            Trusted by leading financial institutions
          </span>
          <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-10 mt-10">
            {partners.map((partner, index) => (
              <div
                key={partner.name}
                className="flex items-center gap-3"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <span className="font-serif font-semibold text-sm text-muted-foreground">
                    {partner.logo}
                  </span>
                </div>
                <span className="text-foreground/80 font-medium text-sm">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Testimonials */}
        <div className="max-w-5xl mx-auto mt-24">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-medium">
              What our clients say
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 150}>
                <div className="testimonial-card hover:shadow-medium transition-all duration-300 h-full">
                  {/* Quote icon */}
                  <svg
                    className="w-8 h-8 text-accent mb-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>

                  <p className="text-foreground leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold text-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.title}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
