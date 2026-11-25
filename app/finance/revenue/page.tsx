import { getFinanceData, sgd, shortDate } from '@/lib/finance-os';

export default async function RevenuePage() {
  const d = await getFinanceData();
  const inflows = d.bank.filter((t) => Number(t.amount) > 0);
  const inflowTotal = inflows.reduce((sum, t) => sum + Number(t.amount), 0);
  const matchedInflows = inflows.filter((t) => t.reconciliation_status === 'matched');
  const reviewInflows = inflows.filter((t) => t.reconciliation_status !== 'matched');

  return (
    <>
      <div className="review-callout">
        <div>
          <strong>Incoming cash is not automatically revenue.</strong>
          <p>Funding, transfers and customer receipts remain separate until the source is classified.</p>
        </div>
        <div className="review-count">{reviewInflows.length}</div>
      </div>

      <div className="finance-grid three">
        <div className="finance-card metric">
          <div className="metric-label">Imported inflows</div>
          <div className="metric-value">{sgd(inflowTotal)}</div>
          <div className="metric-sub">Gross positive OCBC entries including funding and transfers</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Matched inflows</div>
          <div className="metric-value good">{matchedInflows.length}</div>
          <div className="metric-sub">Bank inflows with a reconciliation match</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Posted revenue journals</div>
          <div className="metric-value">0</div>
          <div className="metric-sub">Revenue remains unposted until finance approval</div>
        </div>
      </div>

      <div className="finance-card" style={{ marginTop: 12 }}>
        <div className="finance-section-head">
          <div>
            <h2>Incoming cash</h2>
            <p>Positive bank transactions with their current reconciliation status.</p>
          </div>
          <div className="big">{inflows.length}</div>
        </div>
        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {inflows.map((row) => (
                <tr key={row.id}>
                  <td className="muted">{shortDate(row.transaction_date)}</td>
                  <td className="primary">{row.description}</td>
                  <td>
                    <span className={`status ${row.reconciliation_status}`}>
                      {row.reconciliation_status}
                    </span>
                  </td>
                  <td className="money in">+{sgd(Number(row.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
