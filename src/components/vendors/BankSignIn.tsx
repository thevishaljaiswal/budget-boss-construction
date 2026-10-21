import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';

export default function BankSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage('');
    const parsed = z.object({ email: z.string().trim().email().max(255), password: z.string().min(8).max(128) }).safeParse({ email, password });
    if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? 'Invalid sign-in details'); return; }
    setBusy(true);
    const credentials = { email: parsed.data.email ?? '', password: parsed.data.password ?? '' };
    const result = signup ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: window.location.href } }) : await supabase.auth.signInWithPassword(credentials);
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (signup && !result.data.session) setMessage('Check your email to confirm your account, then sign in.');
  }
  async function social(provider: 'google' | 'lovable') {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + '/vendors' });
    if (result.error) setMessage(result.error.message);
  }
  return <div className="max-w-md space-y-4 py-4">
    <h3 className="font-semibold">{signup ? 'Create account' : 'Sign in to bank requests'}</h3>
    <form onSubmit={submit} className="space-y-3">
      <div><Label htmlFor="bank-email">Email</Label><Input id="bank-email" type="email" autoComplete="email" maxLength={255} value={email} onChange={e => setEmail(e.target.value)} required /></div>
      <div><Label htmlFor="bank-password">Password</Label><Input id="bank-password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} required /></div>
      <Button disabled={busy} type="submit">{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</Button>
      <Button type="button" variant="ghost" onClick={() => setSignup(!signup)}>{signup ? 'Sign in instead' : 'Create account'}</Button>
    </form>
    <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => social('google')}>Continue with Google</Button><Button variant="outline" onClick={() => social('lovable')}>Continue with Lovable</Button></div>
    {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
  </div>;
}