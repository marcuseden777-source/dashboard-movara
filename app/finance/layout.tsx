import type { ReactNode } from 'react';
import FinanceNav from '@/components/finance/FinanceNav';
import './finance.css';
import './finance-enhancements.css';
import './finance-explorer.css';
import './finance-decisions.css';

export default function FinanceLayout({ children }: { children: ReactNode }) {
  return (
    <section className="finance-os">
      <div className="finance-top">
        <div>
          <div className="finance-kicker">MOVARA OS / FINANCE</div>
          <h1>Finance <em>Command Centre</em></h1>
          <p>See what came in, what went out, what is proven, and what still needs a decision.</p>
        </div>
        <div className="live-pill"><span /> CONNECTED</div>
      </div>
      <FinanceNav />
      {children}
    </section>
  );
}
