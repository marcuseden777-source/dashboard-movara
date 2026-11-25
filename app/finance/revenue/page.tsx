import { getFinanceData, sgd, shortDate } from '@/lib/finance-os';

export default async function RevenuePage() {
  const d = await getFinanceData();
  const bankInflows = d.bank.filter((t) => Number(t.amount) > 0);
  const fundingInflows = bankInflows.filter((t) => t.classification === 'funding');
  const otherReviewInflows = bankInflows.filter(
    (t) => t.classification !== 'revenue' && t.classification !== 'funding'
  );
  const fundingTotal = fundingInflows.reduce((sum, row) => sum + Number(row.amount), 0);
  const reviewTotal = otherReviewInflows.reduce((sum, row) => sum + Number(row.amount), 0);

  return (
    <>
      <div className="review-callout">
        <div>
          <strong>Cash received is separated from accounting revenue.</strong>
          <p>Customer income, owner funding and unclassified inflows are shown independently so the P&amp;L is not overstated.</p>
        </div>
        <div className="review-count">{d.postIncorporationRevenue.length}</div>
      </div>

      <div className="finance-grid pnl-grid">
        <div className="finance-card metric">
          <div className="metric-label">Recorded revenue</div>
          <div className="metric-value">{sgd(d.draftRevenue)}</div>
          <div className="metric-sub">All post-incorporation revenue records currently in the ledger</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">OCBC-reconciled</div>
          <div className="metric-value good">{sgd(d.reconciledRevenue)}</div>
          <div className="metric-sub">Linked to explicit company-bank references</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Other recorded revenue</div>
          <div className="metric-value warn">{sgd(d.otherRecordedRevenue)}</div>
          <div className="metric-sub">Legacy/admin entries still requiring source validation</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Funding inflows</div>
          <div className="metric-value">{sgd(fundingTotal)}</div>
          <div className="metric-sub">Balance-sheet candidates, deliberately excluded from revenue</div>
        </div>
      </div>

      <div className="finance-grid two" style={{ marginTop: 12 }}>
        <div className="finance-card">
          <div className="finance-section-head">
            <div>
              <h2>Recorded revenue entries</h2>
              <p>Revenue records currently feeding the draft P&amp;L.</p>
            </div>
            <div className="big">{d.postIncorporationRevenue.length}</div>
          </div>
          <div className="finance-table-wrap">
            <table className="finance-table">
              <thead>
                <tr><th>Date</th><th>Description</th><th>Source</th><th>Bank reference</th><th>Amount</th></tr>
              </thead>
              <tbody>
                {d.postIncorporationRevenue.map((row) => (
                  <tr key={row.id}>
                    <td className="muted">{shortDate(row.received_at)}</td>
                    <td className="primary">{row.description}</td>
                    <td><span className={`status ${row.source === 'ocbc_reconciliation' ? 'matched' : 'review'}`}>
                      {row.source === 'ocbc_reconciliation' ? 'OCBC matched' : 'Legacy record'}
                    </span></td>
                    <td className="muted">{row.external_ref || '—'}</td>
                    <td className="money in">+{sgd(Number(row.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="finance-card">
          <div className="finance-section-head">
            <div>
              <h2>Bank inflows outside revenue</h2>
              <p>Funding and unclear receipts kept off the P&amp;L.</p>
            </div>
            <div className="big">{fundingInflows.length + otherReviewInflows.length}</div>
          </div>
          <div className="pnl-scope-list">
            <div><span>Funding candidates</span><b>{fundingInflows.length} · {sgd(fundingTotal)}</b></div>
            <div><span>Other review inflows</span><b>{otherReviewInflows.length} · {sgd(reviewTotal)}</b></div>
            <div><span>Posted revenue journals</span><b>{Number(d.alignment.posted_journals || 0)}</b></div>
          </div>
          <div className="finance-table-wrap" style={{ marginTop: 8 }}>
            <table className="finance-table">
              <thead><tr><th>Date</th><th>Description</th><th>Proposed treatment</th><th>Amount</th></tr></thead>
              <tbody>
                {[...fundingInflows, ...otherReviewInflows].map((row) => (
                  <tr key={row.id}>
                    <td className="muted">{shortDate(row.transaction_date)}</td>
                    <td className="primary">{row.description}</td>
                    <td className="muted" style={{ maxWidth: 250, whiteSpace: 'normal' }}>
                      {row.business_purpose || row.classification || 'Needs review'}
                    </td>
                    <td className="money in">+{sgd(Number(row.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
