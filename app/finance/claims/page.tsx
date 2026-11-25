import { getFinanceData, sgd, shortDate } from '@/lib/finance-os';

export default async function ClaimsPage() {
  const d = await getFinanceData();

  return (
    <>
      <div className="review-callout">
        <div>
          <strong>Nothing on this page is automatically reimbursed.</strong>
          <p>Claims remain review-only until business purpose, evidence and finance approval are complete.</p>
        </div>
        <div className="review-count">{d.claimsReview.length}</div>
      </div>

      <div className="finance-card">
        <div className="finance-section-head">
          <div><h2>Personal-funded claims</h2><p>Prepared for review; approval and payment remain separate controls.</p></div>
          <div className="big">{sgd(d.claimsReviewTotal)}</div>
        </div>
        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead><tr><th>Date</th><th>Claimant</th><th>Description</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              {d.claims.map((claim) => (
                <tr key={claim.id}>
                  <td className="muted">{shortDate(claim.incurred_on)}</td>
                  <td>{d.partyById[claim.claimant_id]?.display_name || '—'}</td>
                  <td className="primary">{claim.description}</td>
                  <td><span className={`status ${claim.status === 'review' ? 'review' : claim.status}`}>{claim.status}</span></td>
                  <td className="money">{sgd(Number(claim.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
