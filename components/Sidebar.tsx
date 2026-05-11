'use client';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { initials } from '@/lib/finance';

const NAV = [
  { href: '/', icon: '◆', label: 'Dashboard' },
  { href: '/clients', icon: '●', label: 'Clients' },
  { href: '/projects', icon: '▤', label: 'Projects' },
  { href: '/tasks', icon: '✓', label: 'Tasks' },
  { section: 'Finances' },
  { href: '/pnl', icon: '∑', label: 'P&L Overview' },
  { href: '/expenses', icon: '▼', label: 'Expenses' },
  { href: '/subscriptions', icon: '↻', label: 'Subscriptions' },
  { href: '/roi', icon: '%', label: 'Project ROI' },
  { section: 'Documents' },
  { href: '/ai-generator', icon: '✨', label: 'AI Generator' },
  { href: '/quotations', icon: '≡', label: 'Quotations' },
  { href: '/invoices', icon: '¤', label: 'Invoices' },
  { section: 'Setup' },
  { href: '/settings', icon: '⚙', label: 'Settings' },
  { href: '/data', icon: '⤓', label: 'Import / Export' },
] as const;

export default function Sidebar({ companyName }: { companyName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">{initials(companyName)}</div>
        <div>
          <div className="brand-name">{companyName}</div>
          <div className="brand-sub">Workflow Dashboard</div>
        </div>
      </div>

      {NAV.map((item, i) => {
        if ('section' in item) {
          return <div key={i} className="nav-section">{item.section}</div>;
        }
        return (
          <button
            key={item.href}
            className={`nav-item${isActive(item.href) ? ' active' : ''}`}
            onClick={() => router.push(item.href)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <button className="nav-item" onClick={signOut} style={{ color: 'var(--muted)' }}>
          <span className="nav-icon">→</span> Sign out
        </button>
      </div>
    </aside>
  );
}
