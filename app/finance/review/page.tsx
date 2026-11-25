import { getFinanceData, sgd, shortDate } from '@/lib/finance-os';

const decisionCopy: Record<string, { label: string; next: string; treatment: string }> = {
  funding: {
    label: 'Owner / director funding',
    next: 'Choose share capital, shareholder loan or director loan for each receipt.',
    treatment: 'Balance sheet',
  },
  transfer: {
    label: 'Related-party / clearing transfers',
    next: 'Confirm reimbursement, intercompany receivable or director-current-account treatment.',
    treatment: 'Outside P&L',
  },
  commission: {
    label: 'Commission payments',
    next: 'Confirm recipient, calculation basis and payroll / contractor support.',
    treatment: 'Probable OpEx',
  },
  review: {
    label: 'Unidentified payments',
    next: 'Identify the supplier, business purpose and supporting document.',
    treatment: 'Unclassified',
  },
  expense: {
    label: 'Expense allocations',
    next: 'Match the transfer to the underlying supplier charge to prevent double counting.',
    treatment: 'Review',
  },
};

export default async function FinanceReviewPage() {
  const d = await getFinanceData();

  const missingBySupplier = new Map<string, { count: number; amount: number }>();
  for (const row of d.reviewMissingEvidence) {
    const supplier = row.supplier || 'Uncategorised';
    const current = missingBySupplier.get(supplier) ?? { count: 0, amount: 0 };
    current.count += 1;
    current.amount += Number(row.amount || 0);
    missingBySupplier.set(supplier, current);
  }
  const missingSuppliers = Array.from(missingBySupplier.entries())
    .map(([supplier, values]) => ({ supplier, ...values }))
    .sort((a, b) => b.amount - a.amount);

  const decisionMap = new Map<string, { count: number; amount: number }>();
  for (const row of d.reviewBank) {
    const key = row.classification || 'review';
    const current = decisionMap.get(key) ?? { count: 0, amount: 0 };
    current.count += 1;
    current.amount += Math.abs(Number(row.amount));
    decisionMap.set(key, current);
  }
  const decisionGroups = Array.from(decisionMap.entries())
    .map(([classification, values]) => ({
      classification,
      ...values,
      ...(decisionCopy[classification] ?? decisionCopy.review),
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <>
      <div className={`books-status-hero ${d.finalPnlReady ? 'ready' : 'review'}`}>
        <div>
          <div className="books-status-kicker">BOOKS ALIGNMENT</div>
          <h2>{d.finalPnlReady ? 'The books are aligned.' : 'The data is captured. The books are still being closed.'}</h2>
          <p>
            Coverage begins from incorporation on {shortDate(d.incorporatedOn)}. Nothing uncertain is being silently pushed into the final P&amp;L.
          </p>
        </div>
        <div className="books-status-score">{d.reconciliationCoverage}%<small>transaction coverage</small></div>
      </div>

      <div className="finance-grid pnl-grid">
        <div className="finance-card metric">
          <div className="metric-label">OCBC payment matching</div>
          <div className="metric-value">{d.bankReconciliationCoverage}%</div>
          <div className="metric-sub">{d.matchedBank.length} of {d.bank.length} bank movements linked to evidence or transfer logic</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">DBS card reconciliation</div>
          <div className="metric-value">{d.cardEvidenceCoverage}%</div>
          <div className="metric-sub">{d.matchedCards.length} of {d.cards.length} card transactions matched</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Document coverage</div>
          <div className="metric-value">{d.reviewDocumentCoverage}%</div>
          <div className="metric-sub">{d.reviewWithEvidence.length} evidenced · {d.reviewMissingEvidence.length} missing proof</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Posted journals</div>
          <div className={`metric-value ${Number(d.alignment.posted_journals || 0) ? 'good' : 'warn'}`}>
            {Number(d.alignment.posted_journals || 0)}
          </div>
          <div className="metric-sub">Final P&amp;L remains draft until approved journals exist</div>
        </div>
      </div>

      <div className="finance-card books-timeline-card" style={{ marginTop: 12 }}>
        <div className="finance-section-head">
          <div><h2>Coverage timeline</h2><p>The exact periods currently represented inside Finance OS.</p></div>
        </div>
        <div className="books-timeline">
          <div><span>Company incorporated</span><b>{shortDate(d.incorporatedOn)}</b></div>
          <div><span>OCBC statement data</span><b>{shortDate(d.alignment.bank_period_start)} – {shortDate(d.alignment.bank_period_end)}</b></div>
          <div><span>DBS card data</span><b>{shortDate(d.alignment.card_period_start)} – {shortDate(d.alignment.card_period_end)}</b></div>
          <div><span>Latest imported card activity</span><b>{shortDate(d.latestDate)}</b></div>
        </div>
      </div>

      <div className="finance-card decision-card" style={{ marginTop: 12 }}>
        <div className="finance-section-head">
          <div>
            <h2>The decisions that will close OCBC</h2>
            <p>{d.reviewBank.length} transactions are condensed into {decisionGroups.length} bookkeeping decisions.</p>
          </div>
        </div>
        <div className="decision-grid">
          {decisionGroups.map((group) => (
            <article key={group.classification} className="decision-item">
              <div className="decision-topline">
                <span>{group.treatment}</span>
                <b>{group.count} item{group.count === 1 ? '' : 's'}</b>
              </div>
              <h3>{group.label}</h3>
              <div className="decision-amount">{sgd(group.amount)}</div>
              <p>{group.next}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="finance-grid two" style={{ marginTop: 12 }}>
        <div className="finance-card">
          <div className="finance-section-head">
            <div>
              <h2>OCBC items needing a decision</h2>
              <p>Funding, transfers and unclear payments are kept off the P&amp;L until classified.</p>
            </div>
            <div className="big">{d.reviewBank.length}</div>
          </div>
          <div className="finance-table-wrap">
            <table className="finance-table">
              <thead><tr><th>Date</th><th>Description</th><th>Proposed treatment</th><th>Amount</th></tr></thead>
              <tbody>
                {d.reviewBank.map((t) => (
                  <tr key={t.id}>
                    <td className="muted">{shortDate(t.transaction_date)}</td>
                    <td className="primary">{t.description}</td>
                    <td className="muted" style={{ maxWidth: 300, whiteSpace: 'normal' }}>
                      {t.business_purpose || 'Purpose requires review'}
                    </td>
                    <td className={`money ${Number(t.amount) > 0 ? 'in' : 'out'}`}>{sgd(Math.abs(Number(t.amount)))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="finance-card">
          <div className="finance-section-head">
            <div>
              <h2>Missing supplier evidence</h2>
              <p>Charges with no clean invoice or receipt currently attached.</p>
            </div>
            <div className="big">{d.reviewMissingEvidence.length}</div>
          </div>
          <div className="finance-table-wrap">
            <table className="finance-table">
              <thead><tr><th>Supplier</th><th>Records</th><th>Review amount</th></tr></thead>
              <tbody>
                {missingSuppliers.map((row) => (
                  <tr key={row.supplier}>
                    <td className="primary">{row.supplier}</td>
                    <td><span className="status missing">{row.count}</span></td>
                    <td className="money">{sgd(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="finance-card" style={{ marginTop: 12 }}>
        <div className="finance-section-head">
          <div>
            <h2>DBS transactions requiring review</h2>
            <p>{sgd(d.unresolvedSpend)} remains outside final accounting treatment.</p>
          </div>
          <div className="big">{d.candidateCards.length}</div>
        </div>
        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th>Reason</th><th>Amount</th></tr></thead>
            <tbody>
              {d.candidateCards.map((t) => (
                <tr key={t.id}>
                  <td className="muted">{shortDate(t.transaction_date)}</td>
                  <td className="primary">{t.merchant_description || '—'}</td>
                  <td className="muted">{t.proposed_category || 'Uncategorised'}</td>
                  <td className="muted" style={{ maxWidth: 440, whiteSpace: 'normal' }}>{t.notes || t.review_status || 'Needs review'}</td>
                  <td className="money">{sgd(Number(t.debit_sgd) - Number(t.credit_sgd))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
