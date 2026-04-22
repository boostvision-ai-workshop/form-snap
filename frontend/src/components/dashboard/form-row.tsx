'use client';

import { useRouter } from 'next/navigation';
import {
  MoreHorizontal,
  Trash2,
  Settings,
  Share2,
  Inbox,
  Copy,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { FormListItem } from '@/lib/api/forms';

interface FormRowProps {
  form: FormListItem;
  onDelete: (form: FormListItem) => void;
}

/** 4-color chip rotation keyed by a stable hash of the form id. */
function chipColorClass(id: string): string {
  // Sum char codes for a stable, deterministic index
  const sum = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const palette = [
    'bg-[var(--color-chip-blue)]',
    'bg-[var(--color-chip-lavender)]',
    'bg-[var(--color-chip-violet)]',
    'bg-secondary',
  ] as const;
  return palette[sum % palette.length];
}

/** Render form initial letter(s) — first char uppercase. */
function formInitial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase();
}

/** Relative timestamp — e.g. "2d ago", "just now". */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function FormRow({ form, onDelete }: FormRowProps) {
  const router = useRouter();
  const chipBg = chipColorClass(form.id);

  return (
    <TableRow
      data-testid="form-row"
      className="h-12 border-b border-border hover:bg-muted/40 transition-colors"
    >
      {/* Name column — icon chip + form name */}
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden="true"
            className={cn(
              'h-8 w-8 flex-shrink-0 rounded-md flex items-center justify-center',
              chipBg,
            )}
          >
            <span className="text-xs font-semibold text-foreground/70">
              {formInitial(form.name)}
            </span>
          </div>
          <button
            type="button"
            className="font-medium text-sm text-foreground truncate hover:text-primary transition-colors text-left"
            onClick={() => router.push(`/dashboard/forms/${form.id}`)}
          >
            {form.name}
          </button>
        </div>
      </TableCell>

      {/* Responses */}
      <TableCell className="px-4 py-3 text-sm text-foreground tabular-nums">
        {form.submission_count.toLocaleString()}
      </TableCell>

      {/* Views — not in API; render placeholder */}
      <TableCell className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
        —
      </TableCell>

      {/* Updated */}
      <TableCell className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
        {relativeTime(form.updated_at)}
      </TableCell>

      {/* Status — visual-only switch (published state not in API) */}
      <TableCell className="px-4 py-3">
        <Switch
          aria-label="Published"
          checked={false}
          onCheckedChange={() => {}}
          disabled
          className="data-[state=checked]:bg-primary"
        />
      </TableCell>

      {/* Actions */}
      <TableCell className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            data-testid="row-menu"
            aria-label="Form actions"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/forms/${form.id}`)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/forms/${form.id}`)}
              >
                <Inbox className="mr-2 h-4 w-4" />
                View submissions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(form)}
              data-testid="delete-form-button"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
