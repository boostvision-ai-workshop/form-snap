'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CopyButtonProps {
  text: string;
  label?: string;
  'data-testid'?: string;
}

export function CopyButton({
  text,
  label = 'Copy',
  'data-testid': testId,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      data-testid={testId}
      className="gap-1.5 shrink-0"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}
