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
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Notification pending', variant: 'secondary' },
  sent: { label: 'Notification sent', variant: 'default' },
  failed: { label: 'Notification not delivered', variant: 'destructive' },
};

export function EmailStatusBadge({ status, className }: EmailStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant={config.variant}
      data-testid="email-status-badge"
      data-status={status}
      className={cn('whitespace-nowrap text-xs', className)}
    >
      {config.label}
    </Badge>
  );
}
