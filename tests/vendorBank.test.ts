import { describe, expect, test } from 'bun:test';
import { bankSchema, validateCheque, canReviewBankChange } from '../src/lib/vendorBank';

describe('Vendor bank change rules', () => {
  test('cancelled cheque attachment is mandatory', () => {
    expect(validateCheque(null)).toBe('Attach a cancelled cheque');
    expect(validateCheque({ name: 'cheque.pdf', type: 'application/pdf', size: 100 })).toBeNull();
  });
  test('only Accounts may review pending bank changes', () => {
    expect(canReviewBankChange(false, 'Pending')).toBe(false);
    expect(canReviewBankChange(true, 'Pending')).toBe(true);
    expect(canReviewBankChange(true, 'Verified')).toBe(false);
    expect(canReviewBankChange(true, 'Rejected')).toBe(false);
  });
  test('bank details require a valid account and IFSC', () => {
    const details = { bankName: 'Test Bank', accountHolderName: 'Vendor', bankBranch: 'Main', bankAccountNo: '1234567890', ifsc: 'HDFC0000001' };
    expect(bankSchema.safeParse(details).success).toBe(true);
    expect(bankSchema.safeParse({ ...details, ifsc: 'wrong' }).success).toBe(false);
    expect(bankSchema.safeParse({ ...details, bankAccountNo: '' }).success).toBe(false);
  });
});