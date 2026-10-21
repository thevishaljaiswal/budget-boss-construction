import { useEffect, useState } from 'react';
import type { Vendor } from '@/types';
import { bankSchema, bankFields, vendorBank, validateCheque, canReviewBankChange } from '@/lib/vendorBank';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function BankWorkflow({ vendor, onSubmitted }: { vendor?: Vendor; onSubmitted?: () => void }) {
  const { bankChangeRequests, addBankChangeRequest, reviewBankChangeRequest } = useAppContext();
  const requests = vendor ? bankChangeRequests.filter(r => r.vendorId === vendor.id) : bankChangeRequests;
  const accounts = !vendor;
  const [details, setDetails] = useState(vendor ? vendorBank(vendor) : { bankName: '', accountHolderName: '', bankAccountNo: '', bankBranch: '', ifsc: '' });
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chequeUrl, setChequeUrl] = useState<string | null>(null);
  useEffect(() => () => { if (chequeUrl) URL.revokeObjectURL(chequeUrl); }, [chequeUrl]);
  function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess('');
    if (!vendor) return;
    const parsed = bankSchema.safeParse(details);
    const chequeError = validateCheque(file);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Invalid bank details'); return; }
    if (chequeError || !file) { setError(chequeError ?? 'Attach a cancelled cheque'); return; }
    if (!reason.trim() || reason.trim().length > 1000) { setError('Enter a reason (maximum 1000 characters)'); return; }
    if (requests.some(r => r.status === 'Pending')) { setError('A request is already pending'); return; }
    addBankChangeRequest({ id: crypto.randomUUID(), vendorId: vendor.id, vendorName: vendor.name, details: parsed.data, previousDetails: vendorBank(vendor), cheque: file, reason: reason.trim(), requestedAt: new Date().toISOString(), status: 'Pending' });
    setSuccess('Request submitted. Current bank details remain unchanged.');
    onSubmitted?.();
  }
  function review(id: string, approve: boolean) {
    setError(''); setSuccess('');
    try {
      reviewBankChangeRequest(id, approve, notes[id] ?? '');
      setSuccess(approve ? 'Verified. Bank master updated for this session.' : 'Rejected. Bank master unchanged.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not review request'); }
  }
  function openCheque(cheque: File) {
    const url = URL.createObjectURL(cheque);
    setChequeUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  const pending = requests.some(r => r.status === 'Pending');
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">{accounts ? 'Accounts Review' : 'Bank Change Request'}</Badge>{vendor && <Button asChild variant="outline" size="sm"><Link to="/bank-verification">Accounts Review</Link></Button>}</div>
    {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
    {success && <p role="status" className="text-sm">{success}</p>}
    {vendor && !pending && !success && <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">{bankFields.map(({ key, label }) => <div key={key}><Label htmlFor={`bank-${key}`}>{label}</Label><Input id={`bank-${key}`} required maxLength={150} value={details[key]} onChange={e => setDetails({ ...details, [key]: e.target.value })} /></div>)}</div>
      <div><Label htmlFor="bank-reason">Reason for change</Label><Textarea id="bank-reason" required maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} /></div>
      <div><Label htmlFor="cancelled-cheque">Cancelled Cheque · PDF, JPG, PNG · up to 10 MB</Label><Input id="cancelled-cheque" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] ?? null)} /></div>
      <Button type="submit" >Submit to Accounts</Button>
    </form>}
    {pending && vendor && <p className="text-sm text-muted-foreground">A bank change is awaiting Accounts verification.</p>}
    <div className="space-y-6">{requests.map(r => {
      const before = r.previousDetails;
      const after = r.details;
      return <section key={r.id} className="border-b pb-6 space-y-3">
        <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{r.vendorName}</h3><Badge variant={r.status === 'Verified' ? 'secondary' : 'outline'}>{r.status}</Badge></div>
        <p className="text-xs text-muted-foreground">{new Date(r.requestedAt).toLocaleString()} · {r.id.slice(0,8)}</p>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2">Field</th><th className="text-left">Current at request</th><th className="text-left">Requested</th></tr></thead><tbody>{bankFields.map(({ key, label }) => <tr key={key} className="border-b"><td className="py-2 pr-3">{label}</td><td className="pr-3 break-all">{before?.[key] || '—'}</td><td className="break-all">{after?.[key] || '—'}</td></tr>)}</tbody></table></div>
        <p className="text-sm break-words">{r.reason}</p>
        <Button variant="outline" size="sm" onClick={() => openCheque(r.cheque)}>View Cancelled Cheque</Button>
        {r.reviewedAt && <p className="text-sm text-muted-foreground">{r.status} on {new Date(r.reviewedAt).toLocaleString()}{r.reviewNotes ? ` · ${r.reviewNotes}` : ''}</p>}
        {canReviewBankChange(accounts, r.status) && <div className="space-y-3"><Label htmlFor={`notes-${r.id}`}>Accounts remarks (required for rejection)</Label><Textarea id={`notes-${r.id}`} maxLength={1000} value={notes[r.id] ?? ''} onChange={e => setNotes({ ...notes, [r.id]: e.target.value })} /><div className="flex flex-wrap gap-2"><Button onClick={() => review(r.id, true)}>Verify & Update Bank Master</Button><Button variant="destructive" disabled={!notes[r.id]?.trim()} onClick={() => review(r.id, false)}>Reject</Button></div></div>}
      </section>;
    })}</div>
    {!vendor && requests.length === 0 && <p className="text-muted-foreground">No bank-change requests available.</p>}
  </div>;
}