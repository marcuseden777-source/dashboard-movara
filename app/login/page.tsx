'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', margin: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div className="brand-logo" style={{ width: 40, height: 40, fontSize: 16 }}>M</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Movara Dashboard</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Agency operations</div>
          </div>
        </div>

        {sent ? (
          <div>
            <div style={{ fontSize: 28, marginBottom: 12 }}>📬</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Check your email</h2>
            <p style={{ color: 'var(--muted)', margin: 0 }}>
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>Sign in</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 20px', fontSize: 13 }}>
              We&apos;ll email you a magic link — no password needed.
            </p>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@agency.com"
              />
            </div>
            {error && (
              <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>
            )}
            <button className="btn primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
