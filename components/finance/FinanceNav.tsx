'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  ['/finance', 'Overview'],
  ['/finance/pnl', 'P&L'],
  ['/finance/transactions', 'Transactions'],
  ['/finance/expenses', 'Expenses'],
  ['/finance/revenue', 'Revenue'],
  ['/finance/assets', 'Assets'],
  ['/finance/claims', 'Claims'],
  ['/finance/documents', 'Documents'],
  ['/finance/review', 'Books status'],
] as const;

export default function FinanceNav() {
  const pathname = usePathname();
  return (
    <nav className="finance-tabs" aria-label="Finance">
      {items.map(([href, label]) => {
        const active = href === '/finance' ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? 'active' : ''}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
