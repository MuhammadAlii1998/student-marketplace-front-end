import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search,
  ShoppingBag,
  Tag,
  Shield,
  CreditCard,
  MessageCircle,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { useState } from 'react';

const categories = [
  {
    icon: ShoppingBag,
    title: 'Buying',
    description: 'How to browse, purchase, and receive items',
  },
  {
    icon: Tag,
    title: 'Selling',
    description: 'Creating listings and managing your sales',
  },
  {
    icon: Shield,
    title: 'Safety',
    description: 'Tips for safe transactions on campus',
  },
  {
    icon: CreditCard,
    title: 'Payments',
    description: 'Payment methods and transaction info',
  },
];

const faqs = [
  {
    question: 'Who can use ESILV Marketplace?',
    answer:
      'ESILV Marketplace is exclusively for verified ESILV students. You need a valid @edu.devinci.fr or @devinci.fr email address and student ID to create an account. This ensures all transactions happen within our trusted campus community.',
  },
  {
    question: 'How do I create a listing?',
    answer:
      "Click the 'Sell' button in the navigation bar, fill out the product details including photos, title, description, category, condition, and price. Your listing will be reviewed by our admin team before going live to ensure it meets our community guidelines.",
  },
  {
    question: 'How do I pay for items?',
    answer:
      'We support multiple payment methods including online payment (3D Secure), bank transfer, and cash on delivery. You can choose your preferred method during checkout. All online payments are processed securely.',
  },
  {
    question: 'What is the exchange feature?',
    answer:
      'Some sellers offer exchange options on their products. If enabled, you can propose to exchange one of your items instead of paying with money. The seller can accept or reject your exchange request.',
  },
  {
    question: 'How do I meet the seller/buyer?',
    answer:
      'We recommend meeting at designated safe spots on the ESILV campus, such as the main lobby, library, or student center. Always meet during campus hours and in well-lit, public areas.',
  },
  {
    question: 'What if I have a problem with a transaction?',
    answer:
      'Contact our support team through the Help Center or email support@esilv-marketplace.fr. You can also report issues directly through the app. We take all complaints seriously and will mediate if needed.',
  },
  {
    question: 'How does the giveaway section work?',
    answer:
      "Students can list study materials, notes, and other items as free giveaways. Other students can add these items to their cart and request pickup without any payment. It's a great way to help fellow students!",
  },
  {
    question: 'Can I edit or delete my listing?',
    answer:
      "Yes! Go to your Profile, select 'My Listings', and you can edit or delete any of your active listings. Sold items will be marked as sold and moved to your sales history.",
  },
];

const safetyTips = [
  'Always meet in public, well-lit areas on campus',
  'Bring a friend when meeting for high-value items',
  'Inspect items thoroughly before paying',
  'Use campus-approved payment methods',
  'Never share personal financial information',
  'Report suspicious behavior immediately',
];

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 lg:py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              How can we help you?
            </h1>
            <p className="text-muted-foreground mb-8">
              Search our help center or browse topics below
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.title}
                className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-card-hover transition-all cursor-pointer"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-heading font-bold mb-6 text-center">
              Frequently Asked Questions
            </h2>

            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-3">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card border border-border/50 rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-medium py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section id="safety" className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-2xl font-heading font-bold">Safety Tips</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {safetyTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border/50"
                >
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 bg-secondary/30">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-heading font-bold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to assist you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat with Support
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Email Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Help;
