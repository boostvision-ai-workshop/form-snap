'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

interface FormMeta {
  id: string;
  name: string;
}

export function PublicFormClient() {
  const router = useRouter();
  const params = useSearchParams();
  const formId = params.get('id');

  const [meta, setMeta] = useState<FormMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load form metadata — in demo mode pull from the store directly.
  useEffect(() => {
    if (!formId) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    (async () => {
      if (IS_DEMO) {
        const { demoStore } = await import('@/lib/api/demo-store');
        const form = demoStore.getForm(formId);
        if (form) setMeta({ id: form.id, name: form.name });
        else setNotFound(true);
        setLoading(false);
        return;
      }
      // Production: no public "get form meta" endpoint yet, show generic title.
      setMeta({ id: formId, name: 'Submit' });
      setLoading(false);
    })();
  }, [formId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formId) return;
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    formData.forEach((value, key) => {
      payload[key] = value.toString();
    });

    try {
      if (IS_DEMO) {
        // Use the interceptor directly (no auth required for public endpoint).
        const { demoIntercept } = await import('@/lib/api/demo-interceptor');
        const res = await demoIntercept(
          `/api/v1/public/forms/${formId}/submissions`,
          { method: 'POST', body: JSON.stringify(payload) },
        );
        if (!res || !res.ok) {
          throw new Error('Failed to submit');
        }
      } else {
        const res = await fetch(
          `${API_URL}/api/v1/public/forms/${formId}/submissions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) throw new Error('Failed to submit');
      }
      router.push('/submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  if (notFound || !formId || !meta) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-lg shadow-[var(--shadow-dialog)] p-10 max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Form not found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The form you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-6 rounded-md btn-gradient text-sm font-medium"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="px-6 py-4 border-b bg-card" style={{ borderColor: 'var(--border)' }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <Image src={assetPath('/form-snap.svg')} alt="FormSnap" width={24} height={24} className="h-6 w-6" />
          <span className="text-sm font-semibold text-foreground">FormSnap</span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="bg-card border border-border rounded-lg shadow-[var(--shadow-dialog)] p-8 max-w-lg w-full space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <CheckCircle2 className="size-3.5" />
              <span>Public submission</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{meta.name}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fill in the fields below. Your response will be delivered to the form owner.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={4} />
            </div>
            {/* Honeypot */}
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              style={{ position: 'absolute', left: '-9999px' }}
              aria-hidden="true"
            />
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-[var(--color-brand-blue-hover)]"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </form>
        </div>
      </main>

      <footer className="px-6 py-4 text-center">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Powered by FormSnap →
        </Link>
      </footer>
    </>
  );
}
