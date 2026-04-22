'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type EmailStatus = 'pending' | 'sent' | 'failed';

interface EmailStatusBadgeProps {
  status: EmailStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  EmailStatus,
  {
    label: string;
    className: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  sent: {
    label: 'Notified',
    variant: 'default',
    className: 'badge-success',
  },
  pending: {
    label: 'Sending\u2026',
    variant: 'secondary',
    className: 'badge-warning',
  },
  failed: {
    label: 'Not delivered',
    variant: 'destructive',
    className: '',
  },
};

export function EmailStatusBadge({ status, className }: EmailStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant={config.variant}
      data-testid="email-status-badge"
      data-status={status}
      className={cn(
        'whitespace-nowrap rounded-full text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
