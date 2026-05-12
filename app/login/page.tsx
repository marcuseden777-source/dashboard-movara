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
    <div className="login-root">
      {/* Ambient background blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo">M</div>
          <div className="login-brand-text">
            <span className="login-brand-name">Movara</span>
            <span className="login-brand-sub">Agency Dashboard</span>
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
                placeholder="you@agency.com"
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
          background: var(--bg);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        /* Subtle ambient glows */
        .login-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.07;
          pointer-events: none;
        }
        .login-blob-1 {
          width: 500px; height: 500px;
          background: #6366f1;
          top: -120px; left: -120px;
        }
        .login-blob-2 {
          width: 400px; height: 400px;
          background: #8b5cf6;
          bottom: -100px; right: -100px;
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 36px 32px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .login-logo {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 20px;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }
        .login-brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .login-brand-name {
          font-weight: 700;
          font-size: 18px;
          color: var(--text);
          letter-spacing: -0.3px;
        }
        .login-brand-sub {
          font-size: 12px;
          color: var(--muted);
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .login-divider {
          height: 1px;
          background: var(--border);
          margin-bottom: 28px;
        }

        .login-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px;
          color: var(--text);
          letter-spacing: -0.3px;
        }
        .login-subtitle {
          font-size: 13px;
          color: var(--muted);
          margin: 0 0 24px;
          line-height: 1.6;
        }

        .login-field {
          margin-bottom: 16px;
        }
        .login-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .login-input {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px;
          color: var(--text);
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .login-input::placeholder {
          color: var(--muted);
          opacity: 0.5;
        }

        .login-error {
          font-size: 13px;
          color: var(--red, #f87171);
          margin: 0 0 14px;
        }

        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
        }
        .login-btn:hover:not(:disabled) { opacity: 0.9; }
        .login-btn:active:not(:disabled) { transform: scale(0.99); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Sent state */
        .login-sent {
          text-align: center;
          padding: 8px 0 4px;
        }
        .login-sent-icon {
          font-size: 40px;
          margin-bottom: 16px;
          filter: grayscale(0);
        }
        .login-sent .login-title { margin-bottom: 12px; }
        .login-sent .login-subtitle {
          margin-bottom: 24px;
        }
        .login-sent strong {
          color: var(--text);
          font-weight: 600;
        }
        .login-back {
          background: none;
          border: 1px solid var(--border);
          color: var(--muted);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .login-back:hover {
          border-color: var(--text);
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
