import { FormDetailClient } from './form-detail-client';

/** Pre-generate static pages for the 3 demo forms. */
export async function generateStaticParams() {
  return [
    { formId: 'demo-contact' },
    { formId: 'demo-newsletter' },
    { formId: 'demo-feedback' },
  ];
}

export default function FormDetailPage() {
  return <FormDetailClient />;
}
