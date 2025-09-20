import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Eye, Brain, Lock, Globe } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze web content in real-time to detect emerging threats and suspicious patterns.",
  },
  {
    icon: Shield,
    title: "Real-time Protection",
    description: "Instant threat detection and blocking with zero-delay response to keep your browsing experience smooth and secure.",
  },
  {
    icon: Eye,
    title: "Privacy Guardian", 
    description: "Comprehensive tracking protection that blocks invasive scripts, cookies, and fingerprinting attempts.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance with minimal impact on browser speed while maintaining maximum security coverage.",
  },
  {
    icon: Lock,
    title: "Data Encryption",
    description: "End-to-end encryption for all data transmission ensuring your sensitive information stays private.",
  },
  {
    icon: Globe,
    title: "Global Threat Intel",
    description: "Connected to worldwide threat intelligence networks for the most up-to-date protection against new attacks.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Advanced Security Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive protection powered by cutting-edge AI technology 
            and real-time threat intelligence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="card-glow border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-purple transition-all duration-300 group"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:shadow-glow transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};