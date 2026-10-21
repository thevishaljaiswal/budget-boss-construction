import PageHeader from '@/components/shared/PageHeader';
import BankWorkflow from '@/components/vendors/BankWorkflow';

export default function BankVerificationPage() {
  return <div className="space-y-6"><PageHeader title="Bank Verification" description="Vendor bank-change requests" /><BankWorkflow /></div>;
}