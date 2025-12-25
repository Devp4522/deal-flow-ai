import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import AnimatedSection from './AnimatedSection';

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'Sign up with your work email to access a 14-day trial of our Pro plan. No credit card required. You\'ll have full access to all features, and our team is available to help you get started. At the end of your trial, choose the plan that fits your needs.',
  },
  {
    question: 'What security standards do you follow?',
    answer: 'We are SOC2 Type II certified and comply with GDPR, CCPA, and industry-specific regulations. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We conduct regular third-party security audits and penetration testing. Our infrastructure runs on enterprise-grade cloud providers with 99.99% uptime SLA.',
  },
  {
    question: 'Can I integrate with our CRM and calendar?',
    answer: 'Yes! MergerFlow integrates seamlessly with major CRMs (Salesforce, HubSpot, Dynamics), calendar apps (Google Calendar, Outlook), communication tools (Slack, Microsoft Teams), and deal-related services (DocuSign, Box, Dropbox). We also offer a robust API for custom integrations.',
  },
  {
    question: 'Is there onboarding and training for enterprise?',
    answer: 'Absolutely. Enterprise customers receive dedicated onboarding with a customer success manager, customized training sessions for your team, and ongoing support. We\'ll help configure workflows, migrate existing data, and ensure your team is productive from day one.',
  },
  {
    question: 'Do you provide custom playbooks for complex deals?',
    answer: 'Yes, we offer pre-built M&A playbooks covering common deal types (buy-side, sell-side, carve-outs, joint ventures) that you can customize. Enterprise customers can work with our team to create bespoke playbooks tailored to your specific processes and compliance requirements.',
  },
  {
    question: 'How does the AI due diligence feature work?',
    answer: 'Our multi-agent AI system automatically ingests documents from your data room, classifies them, extracts key information, and surfaces potential risks or inconsistencies. It generates summaries, creates diligence checklists, and flags items requiring human review — reducing manual work by up to 70%.',
  },
  {
    question: 'Can I export my data if I decide to leave?',
    answer: 'Yes, you own your data. We provide full data export capabilities in standard formats (CSV, JSON, PDF). Enterprise customers receive dedicated export assistance to ensure a smooth transition. There are no lock-in contracts or data hostage situations.',
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="section-padding">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <AnimatedSection className="text-center mb-12">
            <span className="inline-block text-accent font-medium text-sm uppercase tracking-wider mb-4">
              FAQ
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl font-medium">
              Frequently asked questions
            </h2>
          </AnimatedSection>

          {/* Accordion */}
          <AnimatedSection delay={200}>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="faq-item rounded-xl px-6 border-none bg-card"
                >
                  <AccordionTrigger className="text-left font-serif text-lg font-medium hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>

          {/* Additional help */}
          <AnimatedSection delay={400} className="text-center mt-12 p-8 rounded-2xl bg-muted/50">
            <h3 className="font-serif text-xl font-medium mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Our team is here to help. Reach out and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@mergerflow.ai"
              className="text-primary font-medium hover:underline"
            >
              support@mergerflow.ai
            </a>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
