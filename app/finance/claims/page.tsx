import { getFinanceData, monthLabel, sgd, shortDate } from '@/lib/finance-os';
import styles from './claims.module.css';

export default async function ClaimsPage() {
  const d = await getFinanceData();

  const readyClaims = d.claims.filter((claim) => claim.status === 'verified');
  const reviewClaims = d.claims.filter((claim) => claim.status === 'review');
  const approvedClaims = d.claims.filter((claim) => claim.status === 'approved');
  const paidClaims = d.claims.filter((claim) => claim.status === 'paid');

  const total = (claims: typeof d.claims) => claims.reduce((sum, claim) => sum + Number(claim.amount), 0);
  const readyTotal = total(readyClaims);
  const reviewTotal = total(reviewClaims);
  const approvedTotal = total(approvedClaims);
  const paidTotal = total(paidClaims);

  const monthMap = new Map<string, { claims: number; amount: number }>();
  for (const claim of readyClaims) {
    if (!claim.incurred_on) continue;
    const month = claim.incurred_on.slice(0, 7);
    const current = monthMap.get(month) ?? { claims: 0, amount: 0 };
    current.claims += 1;
    current.amount += Number(claim.amount);
    monthMap.set(month, current);
  }
  const readyMonths = Array.from(monthMap.entries())
    .map(([month, values]) => ({ month, ...values }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <>
      <div className="review-callout">
        <div>
          <strong>Verified claims are ready for Yap Lee Woon’s approval.</strong>
          <p>Verification confirms the business amount and evidence. Approval, transfer and marking the claim paid remain separate controls.</p>
        </div>
        <div className="review-count">{readyClaims.length}</div>
      </div>

      <div className={styles.metrics}>
        <article className={styles.metricPrimary}>
          <span>Ready for approval</span>
          <strong>{sgd(readyTotal)}</strong>
          <p>{readyClaims.length} verified claims · not yet paid</p>
        </article>
        <article className={styles.metric}>
          <span>Still under review</span>
          <strong>{sgd(reviewTotal)}</strong>
          <p>{reviewClaims.length} claims need evidence or a decision</p>
        </article>
        <article className={styles.metric}>
          <span>Approved, awaiting transfer</span>
          <strong>{sgd(approvedTotal)}</strong>
          <p>{approvedClaims.length} approved claims</p>
        </article>
        <article className={styles.metric}>
          <span>Reimbursed to date</span>
          <strong>{sgd(paidTotal)}</strong>
          <p>{paidClaims.length} paid claims</p>
        </article>
      </div>

      {readyMonths.length > 0 && (
        <section className={styles.batchSection}>
          <div className={styles.batchHeader}>
            <div>
              <div className={styles.kicker}>REIMBURSEMENT PACK</div>
              <h2>Evidence-backed personal-card spend</h2>
              <p>Transfer only after Yap approves the verified claims. Use the company bank account and retain the transfer confirmation.</p>
            </div>
            <div className={styles.batchTotal}>
              <span>Total ready</span>
              <strong>{sgd(readyTotal)}</strong>
            </div>
          </div>

          <div className={styles.monthGrid}>
            {readyMonths.map((row) => (
              <article key={row.month} className={styles.monthCard}>
                <span>{monthLabel(row.month)}</span>
                <strong>{sgd(row.amount)}</strong>
                <small>{row.claims} verified claims</small>
              </article>
            ))}
          </div>

          <div className={styles.transferNote}>
            <div>
              <span>Payee</span>
              <strong>Choo Shi Hui</strong>
            </div>
            <div>
              <span>Suggested bank reference</span>
              <strong>MOVARA REIMB AUG–SEP 2026</strong>
            </div>
            <div>
              <span>Approver</span>
              <strong>Yap Lee Woon</strong>
            </div>
            <div>
              <span>Current state</span>
              <strong>Verified · unpaid</strong>
            </div>
          </div>
        </section>
      )}

      <div className="finance-card" style={{ marginTop: 12 }}>
        <div className="finance-section-head">
          <div>
            <h2>Ready for approval</h2>
            <p>Business-only amounts, including proportional card fees where a mixed Apple charge was split.</p>
          </div>
          <div className="big">{sgd(readyTotal)}</div>
        </div>
        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead><tr><th>Date</th><th>Claimant</th><th>Description</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              {readyClaims.map((claim) => (
                <tr key={claim.id}>
                  <td className="muted">{shortDate(claim.incurred_on)}</td>
                  <td>{d.partyById[claim.claimant_id]?.display_name || '—'}</td>
                  <td className="primary">{claim.description}</td>
                  <td><span className={`${styles.statusPill} ${styles.verified}`}>verified</span></td>
                  <td className="money">{sgd(Number(claim.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="finance-card" style={{ marginTop: 12 }}>
        <div className="finance-section-head">
          <div>
            <h2>Held for review</h2>
            <p>These claims are not part of the transfer pack until evidence and business purpose are clear.</p>
          </div>
          <div className="big">{sgd(reviewTotal)}</div>
        </div>
        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead><tr><th>Date</th><th>Claimant</th><th>Description</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              {reviewClaims.map((claim) => (
                <tr key={claim.id}>
                  <td className="muted">{shortDate(claim.incurred_on)}</td>
                  <td>{d.partyById[claim.claimant_id]?.display_name || '—'}</td>
                  <td className="primary">{claim.description}</td>
                  <td><span className={`${styles.statusPill} ${styles.reviewStatus}`}>review</span></td>
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
