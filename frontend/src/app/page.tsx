import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function Home() {
  const features = [
    {
      icon: "🚀",
      title: "Full-Stack Template",
      description: "Next.js frontend + FastAPI backend, ready to go",
    },
    {
      icon: "🔐",
      title: "Authentication Built-in",
      description: "Firebase Auth with email, Google, and GitHub login",
    },
    {
      icon: "🗄️",
      title: "Database Ready",
      description: "Supabase Postgres with async SQLAlchemy ORM",
    },
    {
      icon: "🤖",
      title: "AI-Powered Development",
      description: "Multi-agent system plans and builds your features",
    },
    {
      icon: "✅",
      title: "Type-Safe",
      description:
        "TypeScript frontend + Python type hints, auto-generated API types",
    },
    {
      icon: "🐳",
      title: "Docker Ready",
      description: "One command to start everything with docker-compose",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <MarketingHeader />

      <section className="py-12 sm:py-16 lg:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="flex flex-col gap-4 max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Build Your SaaS Product with AI
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                A production-ready template with Next.js, FastAPI, Firebase
                Auth, and Supabase. Get started in minutes, not weeks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  Get Started
                </Button>
              </Link>
              <Link
                href="https://github.com/code-yeongyu/micro-saas-agent"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Everything You Need to Build Fast
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A complete stack with modern tools and best practices built in
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="text-4xl mb-2">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-32 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to Build Your SaaS?
              </h2>
              <p className="text-lg text-muted-foreground">
                Start with a production-ready foundation and ship faster
              </p>
            </div>

            <Link href="/signup">
              <Button size="lg" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
