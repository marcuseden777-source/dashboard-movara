import type { ReactNode } from 'react';
import FinanceNav from '@/components/finance/FinanceNav';
import './finance.css';

export default function FinanceLayout({ children }: { children: ReactNode }) {
  return (
    <section className="finance-os">
      <div className="finance-top">
        <div>
          <div className="finance-kicker">MOVARA OS / FINANCE</div>
          <h1>Finance <em>Command Centre</em></h1>
          <p>One operating view across cash, cards, evidence, assets and approvals.</p>
        </div>
        <div className="live-pill"><span /> LIVE BOOKS</div>
      </div>
      <FinanceNav />
      {children}
    </section>
  );
}
