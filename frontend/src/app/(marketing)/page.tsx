import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const features = [
    {
      title: 'One endpoint, zero backends',
      description:
        'Paste a single <form action> URL into any static site. FormSnap handles storage, spam filtering, and delivery.',
    },
    {
      title: 'Instant email notifications',
      description:
        'Every submission triggers an email to you within seconds — no polling, no dashboards, just your inbox.',
    },
    {
      title: 'Browse & export submissions',
      description:
        'View every submission in a clean inbox. Download all responses as CSV with one click.',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="py-16 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center gap-8">
            <Badge variant="secondary">Free to start</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Form submissions,<br className="hidden sm:block" /> handled for you
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              FormSnap gives your static site a real form backend in seconds. One URL, zero
              server configuration, instant email notifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[var(--color-accent-blue)] text-[var(--color-accent-blue-foreground)] hover:bg-[var(--color-accent-blue-hover)]"
                >
                  Get started free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign in
                </Button>
              </Link>
            </div>
            <div className="w-full max-w-lg rounded-lg border border-[var(--color-code-border)] bg-[var(--color-code-surface)] p-4 font-mono text-sm text-[var(--color-code-foreground)] text-left overflow-x-auto">
              <code>{`<form action="https://api.formsnap.example/f/your-id" method="POST">\n  <input name="email" type="email" />\n  <button type="submit">Send</button>\n</form>`}</code>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Feature grid */}
      <section className="py-16 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A complete form backend with modern tooling and sane defaults.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="transition-shadow hover:shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
