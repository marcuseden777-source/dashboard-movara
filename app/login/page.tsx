'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MovaraMark } from '@/components/brand/MovaraMark';

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
    <div className="login-root">
      {/* Ambient background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo"><MovaraMark /></div>
          <div className="login-brand-text">
            <span className="login-brand-name">Movara <em>Solutions</em></span>
            <span className="login-brand-sub">Operating System</span>
          </div>
        </div>

        <div className="login-divider" />

        {sent ? (
          <div className="login-sent">
            <div className="login-sent-icon">✉</div>
            <h2 className="login-title">Check your inbox</h2>
            <p className="login-subtitle">
              Magic link sent to<br />
              <strong>{email}</strong>
            </p>
            <button
              className="login-back"
              onClick={() => { setSent(false); setEmail(''); }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-title">Sign in</h2>
            <p className="login-subtitle">
              Enter your email and we&apos;ll send a magic link.<br />No password needed.
            </p>

            <div className="login-field">
              <label className="login-label">Email address</label>
              <input
                className="login-input"
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@movara.co"
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              className="login-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                'Send magic link →'
              )}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background:
            radial-gradient(58rem 28rem at 50% -10rem, rgba(226,211,189,.07), transparent 72%),
            var(--bg);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .login-blob { display: none; }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background:
            linear-gradient(155deg, rgba(239,233,223,.04), transparent 46%),
            rgba(23,21,19,.88);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 34px 32px 30px;
          box-shadow: 0 28px 80px rgba(0,0,0,.28);
          backdrop-filter: blur(18px);
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .login-logo {
          width: 36px;
          height: 40px;
          display: grid;
          place-items: center;
          color: var(--text);
          flex-shrink: 0;
        }
        .login-logo svg { width: 24px; height: auto; }
        .login-brand-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .login-brand-name {
          font-family: var(--font-head);
          font-weight: 500;
          font-size: 18px;
          color: var(--text);
          letter-spacing: -.03em;
        }
        .login-brand-name em {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 400;
          color: rgba(239,233,223,.78);
        }
        .login-brand-sub {
          font-family: var(--font-mono);
          font-size: 8px;
          color: var(--muted);
          letter-spacing: .17em;
          text-transform: uppercase;
        }

        .login-divider {
          height: 1px;
          background: var(--border);
          margin-bottom: 28px;
        }
        .login-title {
          margin: 0 0 8px;
          color: var(--text);
          font-family: var(--font-head);
          font-size: 23px;
          font-weight: 500;
          letter-spacing: -.035em;
        }
        .login-subtitle {
          margin: 0 0 24px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.6;
        }
        .login-field { margin-bottom: 16px; }
        .login-label {
          display: block;
          margin-bottom: 8px;
          color: var(--muted);
          font-family: var(--font-mono);
          font-size: 8px;
          font-weight: 400;
          letter-spacing: .15em;
          text-transform: uppercase;
        }
        .login-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(239,233,223,.025);
          border: 1px solid var(--border);
          border-radius: 9px;
          padding: 12px 13px;
          color: var(--text);
          font-size: 13px;
          outline: none;
          transition: border-color .16s, box-shadow .16s;
        }
        .login-input:focus {
          border-color: rgba(226,211,189,.52);
          box-shadow: 0 0 0 3px rgba(226,211,189,.07);
        }
        .login-input::placeholder { color: rgba(163,155,144,.48); }

        .login-error {
          margin: 0 0 14px;
          color: var(--red);
          font-size: 12px;
        }
        .login-btn {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--text);
          border-radius: 999px;
          background: var(--text);
          color: var(--bg);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color .16s, color .16s, transform .28s var(--ease-expo);
        }
        .login-btn:hover:not(:disabled) {
          background: transparent;
          color: var(--text);
          transform: translateY(-1px);
        }
        .login-btn:disabled { opacity: .5; cursor: not-allowed; }
        .login-spinner {
          width: 15px; height: 15px;
          border: 1.5px solid rgba(15,14,13,.25);
          border-top-color: #171513;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-sent { text-align: center; padding: 8px 0 4px; }
        .login-sent-icon {
          width: 40px;
          height: 40px;
          margin: 0 auto 16px;
          display: grid;
          place-items: center;
          border: 1px solid var(--border);
          border-radius: 50%;
          color: var(--sand);
          font-size: 18px;
        }
        .login-sent .login-title { margin-bottom: 12px; }
        .login-sent .login-subtitle { margin-bottom: 24px; }
        .login-sent strong { color: var(--text); font-weight: 500; }
        .login-back {
          min-height: 40px;
          padding: 8px 16px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: transparent;
          color: var(--muted);
          font-size: 11px;
          cursor: pointer;
          transition: border-color .16s, color .16s;
        }
        .login-back:hover {
          border-color: rgba(239,233,223,.35);
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
