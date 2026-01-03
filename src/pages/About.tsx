import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  ShieldCheck, 
  Users, 
  Recycle, 
  Target, 
  Heart,
  ExternalLink
} from "lucide-react";
import esilvLogo from "@/assets/esilv-marketplace-logo.png";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    description: "All users are verified ESILV students. Transactions happen within our trusted campus community.",
  },
  {
    icon: Recycle,
    title: "Sustainability",
    description: "Promote circular economy by giving products a second life instead of buying new.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Built by students, for students. Connect with fellow engineers and share resources.",
  },
  {
    icon: Heart,
    title: "Affordability",
    description: "Access quality products at student-friendly prices. Save money on textbooks and equipment.",
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <img src={esilvLogo} alt="ESILV" className="h-20 mx-auto mb-6" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">
              About ESILV Marketplace
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              The official student marketplace for École Supérieure d'Ingénieurs Léonard de Vinci. 
              A platform designed to help ESILV students buy, sell, and exchange products within our engineering community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/products">
                <Button size="lg">Start Shopping</Button>
              </Link>
              <a href="https://www.esilv.fr/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2">
                  Visit ESILV
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  ESILV Marketplace was created to address the unique needs of engineering students. 
                  We understand the high costs of technical textbooks, calculators, and equipment that 
                  students need throughout their studies.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform enables students to buy and sell used items at fair prices, 
                  reducing waste and making education more affordable. From textbooks to electronics, 
                  furniture to sports equipment — if a student needs it, they can find it here.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
                  <GraduationCap className="h-32 w-32 text-primary/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              What makes ESILV Marketplace different from other marketplaces.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-xl bg-card border border-border/50 text-center hover:shadow-card-hover transition-shadow"
              >
                <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESILV Info */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">About ESILV</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              ESILV (École Supérieure d'Ingénieurs Léonard de Vinci) is a prestigious French engineering 
              school located at La Défense, Paris. Part of the Pôle Léonard de Vinci, ESILV offers 
              cutting-edge programs in digital engineering, finance, new energies, and more.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <p className="text-3xl font-heading font-bold text-primary mb-2">2,500+</p>
                <p className="text-sm text-muted-foreground">Engineering Students</p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <p className="text-3xl font-heading font-bold text-primary mb-2">CTI</p>
                <p className="text-sm text-muted-foreground">Accredited Program</p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <p className="text-3xl font-heading font-bold text-primary mb-2">Top 30</p>
                <p className="text-sm text-muted-foreground">Engineering Schools in France</p>
              </div>
            </div>
            <a href="https://www.esilv.fr/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                Learn More About ESILV
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join the ESILV Marketplace community today. Whether you're looking to buy, sell, or exchange — 
              we've got you covered.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login">
                <Button size="lg">Create Account</Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline">Browse Products</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;