import { describe, expect, test } from 'bun:test';
import { bankSchema, validateCheque, canReviewBankChange, reviewBankRequest, BankChangeRequest } from '../src/lib/vendorBank';

describe('Vendor bank change rules', () => {
  const request: BankChangeRequest = { id: 'request-1', vendorId: 'vendor-1', vendorName: 'Vendor', details: { bankName: 'New Bank', accountHolderName: 'Vendor', bankBranch: 'Main', bankAccountNo: '1234567890', ifsc: 'HDFC0000001' }, previousDetails: { bankName: 'Old Bank', accountHolderName: 'Vendor', bankBranch: 'Old', bankAccountNo: '9876543210', ifsc: 'HDFC0000002' }, cheque: new File(['cheque'], 'cheque.pdf', { type: 'application/pdf' }), reason: 'Change bank', requestedAt: '2026-10-21', status: 'Pending' };
  test('submission keeps current bank details unchanged until simulated review', () => {
    expect(request.previousDetails.bankName).toBe('Old Bank');
    const reviewed = reviewBankRequest(request, true, 'Checked');
    expect(reviewed.status).toBe('Verified');
    expect(reviewed.details.bankName).toBe('New Bank');
    expect(request.status).toBe('Pending');
  });
  test('rejection leaves bank master unchanged and requires remarks', () => {
    expect(() => reviewBankRequest(request, false, '')).toThrow();
    expect(reviewBankRequest(request, false, 'Cheque does not match').status).toBe('Rejected');
    expect(request.previousDetails.bankName).toBe('Old Bank');
    expect(() => reviewBankRequest({ ...request, status: 'Verified' }, true, '')).toThrow();
  });
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