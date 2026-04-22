import { Card, CardContent } from '@/components/ui/card';
import {
  Zap,
  Inbox,
  Download,
  Shield,
  Globe,
  BarChart2,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'One endpoint, zero backends',
    description:
      'Paste a single form action URL into any static site. FormSnap handles storage, spam filtering, and delivery.',
  },
  {
    icon: Inbox,
    title: 'Instant email notifications',
    description:
      'Every submission triggers an email to you within seconds — no polling, no dashboards, just your inbox.',
  },
  {
    icon: Download,
    title: 'Browse & export submissions',
    description:
      'View every submission in a clean inbox. Download all responses as CSV with one click.',
  },
  {
    icon: Shield,
    title: 'Built-in spam protection',
    description:
      'Honeypot field detection and rate limiting keep your inbox free of bot submissions out of the box.',
  },
  {
    icon: Globe,
    title: 'Works with any stack',
    description:
      'HTML, React, Vue, Next.js — if it sends an HTTP POST, FormSnap handles it. No SDK required.',
  },
  {
    icon: BarChart2,
    title: 'Submission analytics',
    description:
      'Track response trends, view completion rates, and understand how your forms are performing over time.',
  },
];

export function FeatureGrid() {
  return (
    <section className="py-20" id="features">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Simple, powerful forms</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Everything you need to collect, manage, and act on form submissions —
            without managing infrastructure.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="shadow-[var(--shadow-card)] rounded-lg border"
            >
              <CardContent className="p-6">
                <div className="rounded-md bg-secondary p-2 w-fit">
                  <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mt-4">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
