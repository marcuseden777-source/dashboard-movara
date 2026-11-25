import { getFinanceData, sgd } from '@/lib/finance-os';

export default async function ExpensesPage() {
  const d = await getFinanceData();
  const totalReview = d.suppliers.reduce((sum, row) => sum + row.amount, 0);

  return (
    <>
      <div className="finance-grid three">
        <div className="finance-card metric">
          <div className="metric-label">Review ledger total</div>
          <div className="metric-value">{sgd(totalReview)}</div>
          <div className="metric-sub">Personal-funded review records; not final booked expense</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Evidence attached</div>
          <div className="metric-value good">{d.reviewWithEvidence.length}</div>
          <div className="metric-sub">Pending rows with invoice, receipt or source evidence</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Missing evidence</div>
          <div className="metric-value warn">{d.reviewMissingEvidence.length}</div>
          <div className="metric-sub">Held for review instead of forced into the books</div>
        </div>
      </div>

      <div className="finance-card" style={{ marginTop: 12 }}>
        <div className="finance-section-head">
          <div><h2>Spend by supplier</h2><p>Evidence status across the personal-funded expense review ledger.</p></div>
        </div>
        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead><tr><th>Supplier</th><th>Records</th><th>Evidence</th><th>Missing</th><th>Review value</th></tr></thead>
            <tbody>
              {d.suppliers.map((row) => (
                <tr key={row.supplier}>
                  <td className="primary">{row.supplier}</td>
                  <td>{row.count}</td>
                  <td><span className="status matched">{row.evidenced}</span></td>
                  <td>{row.missing ? <span className="status missing">{row.missing}</span> : <span className="status matched">0</span>}</td>
                  <td className="money">{sgd(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
