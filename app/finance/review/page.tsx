import { getFinanceData, sgd, shortDate } from '@/lib/finance-os';

export default async function FinanceReviewPage() {
  const d = await getFinanceData();

  return (
    <>
      <div className="review-callout">
        <div>
          <strong>Decision queue</strong>
          <p>These are intentionally not finalised. The system needs evidence or an explicit finance decision.</p>
        </div>
        <div className="review-count">{d.candidateCards.length}</div>
      </div>

      <div className="finance-card">
        <div className="finance-section-head">
          <div><h2>Transactions requiring review</h2><p>{sgd(d.unresolvedSpend)} currently held outside final accounting treatment.</p></div>
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
                  <td className="muted" style={{ maxWidth: 420, whiteSpace: 'normal' }}>{t.notes || t.review_status || 'Needs review'}</td>
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
