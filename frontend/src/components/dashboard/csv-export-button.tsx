'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadSubmissionsCsv } from '@/lib/api/submissions';

interface CsvExportButtonProps {
  formId: string;
  formName: string;
}

export function CsvExportButton({ formId, formName }: CsvExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      await downloadSubmissionsCsv(formId, formName);
    } catch (err) {
      // Surface errors via console; could be enhanced with a toast
      console.error('CSV export failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      data-testid="export-csv-button"
    >
      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
      {loading ? 'Exporting…' : 'Export CSV'}
    </Button>
  );
}
