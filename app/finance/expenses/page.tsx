import { getFinanceData, sgd } from '@/lib/finance-os';

export default async function ExpensesPage() {
  const d = await getFinanceData();
  const totalReview = d.suppliers.reduce((sum, row) => sum + row.amount, 0);
  const preIncorporationTotal = d.preIncorporationLegacyExpenses.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  const categoryMap = new Map<string, { count: number; amount: number }>();
  for (const row of d.postIncorporationLegacyExpenses) {
    const category = row.category || 'Uncategorised';
    const current = categoryMap.get(category) ?? { count: 0, amount: 0 };
    current.count += 1;
    current.amount += Number(row.amount || 0);
    categoryMap.set(category, current);
  }
  const categories = Array.from(categoryMap.entries())
    .map(([category, values]) => ({ category, ...values }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <>
      <div className="review-callout">
        <div>
          <strong>Two historical expense pools are being reconciled.</strong>
          <p>The legacy expense ledger and personal-funded review ledger may overlap. They are shown separately and must not be added together until duplicate cleanup is complete.</p>
        </div>
        <div className="review-count">2</div>
      </div>

      <div className="finance-grid pnl-grid">
        <div className="finance-card metric">
          <div className="metric-label">Legacy recorded expenses</div>
          <div className="metric-value">{sgd(d.legacyRecordedExpenses)}</div>
          <div className="metric-sub">{d.postIncorporationLegacyExpenses.length} entries dated on or after incorporation</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Personal-funded review pool</div>
          <div className="metric-value">{sgd(totalReview)}</div>
          <div className="metric-sub">Review ledger only; not an additional booked total</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Evidence attached</div>
          <div className="metric-value good">{sgd(Number(d.alignment.evidenced_expenses_in_review || 0))}</div>
          <div className="metric-sub">{d.reviewWithEvidence.length} pending records with supporting evidence</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Missing evidence</div>
          <div className="metric-value warn">{sgd(Number(d.alignment.missing_evidence_amount || 0))}</div>
          <div className="metric-sub">{d.reviewMissingEvidence.length} records held outside final treatment</div>
        </div>
      </div>

      <div className="finance-grid two" style={{ marginTop: 12 }}>
        <div className="finance-card">
          <div className="finance-section-head">
            <div>
              <h2>Legacy expense ledger by category</h2>
              <p>Existing recorded expenses after the 9 June 2026 incorporation date.</p>
            </div>
            <div className="big">{categories.length}</div>
          </div>
          <div className="finance-table-wrap">
            <table className="finance-table">
              <thead><tr><th>Category</th><th>Records</th><th>Recorded amount</th></tr></thead>
              <tbody>
                {categories.map((row) => (
                  <tr key={row.category}>
                    <td className="primary">{row.category}</td>
                    <td>{row.count}</td>
                    <td className="money">{sgd(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="finance-mini-summary">
            <div><span>Pre-incorporation records</span><b>{d.preIncorporationLegacyExpenses.length}</b></div>
            <div><span>Pre-incorporation value</span><b>{sgd(preIncorporationTotal)}</b></div>
          </div>
        </div>

        <div className="finance-card">
          <div className="finance-section-head">
            <div>
              <h2>Personal-funded review by supplier</h2>
              <p>Evidence status before reimbursement or accounting approval.</p>
            </div>
            <div className="big">{d.suppliers.length}</div>
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
      </div>

      <div className="pnl-note" style={{ margin: '12px 0 0' }}>
        Final expenses will come from one deduplicated source of truth. Until then, the draft P&amp;L uses the legacy expense ledger only and keeps the personal-funded review pool separate.
      </div>
    </>
  );
}
