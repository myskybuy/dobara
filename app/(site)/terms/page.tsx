import { LEGAL } from '@/lib/legal';
import { LegalPage } from '@/components/LegalPage';

export const metadata = { title: 'Terms & conditions' };

export default function TermsPage() {
  return <LegalPage doc={LEGAL.terms} active="terms" />;
}
