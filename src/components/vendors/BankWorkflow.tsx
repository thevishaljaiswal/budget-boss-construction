import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { Vendor } from '@/types';
import { bankSchema, bankFields, vendorBank, validateCheque, canReviewBankChange } from '@/lib/vendorBank';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import BankSignIn from './BankSignIn';

export default function BankWorkflow({ vendor, onSubmitted }: { vendor?: Vendor; onSubmitted?: () => void }) {
  const { refreshVendorBanks } = useAppContext();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [accounts, setAccounts] = useState(false);
  const [requests, setRequests] = useState<Tables<'vendor_bank_requests'>[]>([]);
  const [details, setDetails] = useState(vendor ? vendorBank(vendor) : vendorBank({} as Vendor));
  const [file, setFile] = useState<File | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function load(current: User) {
    const role = await supabase.rpc('has_role', { _user_id: current.id, _role: 'accounts' });
    setAccounts(role.data === true);
    let query = supabase.from('vendor_bank_requests').select('*').order('requested_at', { ascending: false });
    if (vendor) query = query.eq('vendor_id', vendor.id);
    const result = await query;
    if (result.error) setError(result.error.message); else setRequests(result.data ?? []);
  }
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setReady(true); } });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { if (active) { setUser(session?.user ?? null); setReady(true); } });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => { if (user) void load(user); else { setRequests([]); setAccounts(false); } }, [user, vendor?.id]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess('');
    if (!user || !vendor) return;
    const parsed = bankSchema.safeParse(details);
    const chequeError = validateCheque(file);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Invalid bank details'); return; }
    if (chequeError || !file) { setError(chequeError ?? 'Attach a cancelled cheque'); return; }
    if (!reason.trim() || reason.trim().length > 1000) { setError('Enter a reason (maximum 1000 characters)'); return; }
    setBusy(true);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    try {
      const upload = await supabase.storage.from('cancelled-cheques').upload(path, file);
      if (upload.error) throw upload.error;
      const result = await supabase.rpc('submit_bank_change', { p_vendor_id: vendor.id, p_vendor_name: vendor.name, p_details: parsed.data, p_previous: vendorBank(vendor), p_cheque_path: path, p_cheque_name: file.name.slice(0,255), p_reason: reason.trim() });
      if (result.error) { await supabase.storage.from('cancelled-cheques').remove([path]); throw result.error; }
      setSuccess('Bank change submitted to Accounts. Current bank details remain unchanged.');
      await load(user); onSubmitted?.();
    } catch (err) { setError(err instanceof Error ? err.message : (err as { message?: string }).message ?? 'Could not submit bank change'); }
    finally { setBusy(false); }
  }
  async function review(id: string, approve: boolean) {
    if (!user) return;
    setBusy(true); setError(''); setSuccess('');
    const result = await supabase.rpc('review_bank_change', { p_request_id: id, p_approve: approve, p_notes: notes[id] ?? '' });
    if (result.error) setError(result.error.message);
    else { setSuccess(approve ? 'Verified. Vendor bank master updated.' : 'Request rejected. Bank master unchanged.'); await load(user); await refreshVendorBanks(); }
    setBusy(false);
  }
  async function openCheque(path: string) {
    const result = await supabase.storage.from('cancelled-cheques').createSignedUrl(path, 60);
    if (result.error) setError(result.error.message);
    else window.open(result.data.signedUrl, '_blank', 'noopener,noreferrer');
  }
  if (!ready) return <p className="py-4 text-muted-foreground">Loading…</p>;
  if (!user) return <BankSignIn />;
  const pending = requests.some(r => r.status === 'Pending');
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">{accounts ? 'Accounts verifier' : 'Requester'}</Badge><Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button></div>
    {error && <p role="alert" className="text-destructive text-sm">{error}</p>}
    {success && <p role="status" className="text-sm">{success}</p>}
    {vendor && !pending && !success && <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">{bankFields.map(({ key, label }) => <div key={key}><Label htmlFor={`bank-${key}`}>{label}</Label><Input id={`bank-${key}`} required maxLength={150} value={details[key]} onChange={e => setDetails({ ...details, [key]: e.target.value })} /></div>)}</div>
      <div><Label htmlFor="bank-reason">Reason for change</Label><Textarea id="bank-reason" required maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} /></div>
      <div><Label htmlFor="cancelled-cheque">Cancelled Cheque · PDF, JPG, PNG · up to 10 MB</Label><Input id="cancelled-cheque" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] ?? null)} /></div>
      <Button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit to Accounts'}</Button>
    </form>}
    {pending && vendor && <p className="text-sm text-muted-foreground">A bank change is awaiting Accounts verification.</p>}
    {!vendor && !accounts && <p className="text-sm text-muted-foreground">Accounts authorization is required to verify requests.</p>}
    <div className="space-y-6">{requests.map(r => {
      const before = r.previous_details as Record<string,string>;
      const after = r.bank_details as Record<string,string>;
      return <section key={r.id} className="border-b pb-6 space-y-3">
        <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{r.vendor_name}</h3><Badge variant={r.status === 'Verified' ? 'secondary' : 'outline'}>{r.status}</Badge></div>
        <p className="text-xs text-muted-foreground">{new Date(r.requested_at).toLocaleString()} · {r.id.slice(0,8)}</p>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2">Field</th><th className="text-left">Current at request</th><th className="text-left">Requested</th></tr></thead><tbody>{bankFields.map(({ key, label }) => <tr key={key} className="border-b"><td className="py-2 pr-3">{label}</td><td className="pr-3 break-all">{before?.[key] || '—'}</td><td className="break-all">{after?.[key] || '—'}</td></tr>)}</tbody></table></div>
        <p className="text-sm break-words">{r.reason}</p>
        <Button variant="outline" size="sm" onClick={() => openCheque(r.cheque_path)}>View Cancelled Cheque</Button>
        {r.reviewed_at && <p className="text-sm text-muted-foreground">{r.status} on {new Date(r.reviewed_at).toLocaleString()}{r.review_notes ? ` · ${r.review_notes}` : ''}</p>}
        {canReviewBankChange(accounts, r.status) && <div className="space-y-3"><Label htmlFor={`notes-${r.id}`}>Accounts remarks (required for rejection)</Label><Textarea id={`notes-${r.id}`} maxLength={1000} value={notes[r.id] ?? ''} onChange={e => setNotes({ ...notes, [r.id]: e.target.value })} /><div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => review(r.id, true)}>Verify & Update Bank Master</Button><Button variant="destructive" disabled={busy || !notes[r.id]?.trim()} onClick={() => review(r.id, false)}>Reject</Button></div></div>}
      </section>;
    })}</div>
    {!vendor && requests.length === 0 && <p className="text-muted-foreground">No bank-change requests available.</p>}
  </div>;
}