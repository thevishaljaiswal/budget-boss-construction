import { z } from 'zod';
import type { Vendor } from '@/types';

export const bankSchema = z.object({
  bankName: z.string().trim().min(1, 'Bank name is required').max(150),
  accountHolderName: z.string().trim().min(1, 'Account holder name is required').max(150),
  bankAccountNo: z.string().trim().regex(/^\d{6,34}$/, 'Enter a valid account number'),
  bankBranch: z.string().trim().min(1, 'Bank branch is required').max(150),
  ifsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC'),
});
export type BankDetails = z.infer<typeof bankSchema>;
export const bankFields: { key: keyof BankDetails; label: string }[] = [
  { key: 'bankName', label: 'Bank Name' },
  { key: 'accountHolderName', label: 'Account Holder Name' },
  { key: 'bankAccountNo', label: 'Bank Account No.' },
  { key: 'bankBranch', label: 'Bank Branch' },
  { key: 'ifsc', label: 'IFSC' },
];
export function vendorBank(vendor: Vendor): BankDetails {
  return { bankName: vendor.bankName ?? '', accountHolderName: vendor.accountHolderName ?? '', bankAccountNo: vendor.bankAccountNo ?? '', bankBranch: vendor.bankBranch ?? '', ifsc: vendor.ifsc ?? '' };
}
export function validateCheque(file: Pick<File, 'name' | 'size' | 'type'> | null): string | null {
  if (!file) return 'Attach a cancelled cheque';
  if (!/\.(pdf|jpe?g|png)$/i.test(file.name) || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) return 'Use a PDF, JPG or PNG cheque';
  if (file.size <= 0 || file.size > 10 * 1024 * 1024) return 'Cheque must be between 1 byte and 10 MB';
  return null;
}
export function canReviewBankChange(isAccounts: boolean, status: string): boolean {
  return isAccounts && status === 'Pending';
}