import Link from 'next/link';
import { MovaraMark } from '@/components/brand/MovaraMark';
import { getFinanceData, monthLabel, sgd, shortDate } from '@/lib/finance-os';

export default async function FinanceOverviewPage() {
  const d = await getFinanceData();
  const maxSupplier = Math.max(...d.suppliers.slice(0, 7).map((x) => x.amount), 1);

  return (
    <>
      <div className="finance-grid metrics">
        <div className="finance-card metric">
          <div className="metric-label">Cash position</div>
          <div className="metric-value">{sgd(d.cashPosition)}</div>
          <div className="metric-sub">Imported OCBC position through current bank ledger</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">{monthLabel(d.latestMonth)} operating spend</div>
          <div className="metric-value">{sgd(d.monthOperatingSpend)}</div>
          <div className="metric-sub">Matched card spend excluding asset instalments</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Asset payments</div>
          <div className="metric-value">{sgd(d.monthAssetPayments)}</div>
          <div className="metric-sub">Current-month capital-asset instalments</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Unresolved card spend</div>
          <div className="metric-value warn">{sgd(d.unresolvedSpend)}</div>
          <div className="metric-sub">{d.candidateCards.length} candidate transactions need evidence</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Claims in review</div>
          <div className="metric-value">{sgd(d.claimsReviewTotal)}</div>
          <div className="metric-sub">{d.claimsReview.length} claims not yet approved or posted</div>
        </div>
      </div>

      <div className="finance-grid two" style={{ marginTop: 12 }}>
        <div className="finance-card">
          <div className="finance-section-head">
            <div>
              <h2>Spend intelligence</h2>
              <p>Personal-funded review ledger grouped by supplier. Review data, not final P&L.</p>
            </div>
            <Link href="/finance/expenses" className="doc-link">View expenses →</Link>
          </div>
          <div className="breakdown">
            {d.suppliers.slice(0, 7).map((row) => (
              <div className="breakdown-row" key={row.supplier}>
                <div className="name">{row.supplier}</div>
                <div className="bar"><span style={{ width: `${Math.max(3, (row.amount / maxSupplier) * 100)}%` }} /></div>
                <div className="value">{sgd(row.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="finance-card finance-agent">
          <div className="agent-mark"><MovaraMark /></div>
          <h3>Finance Agent</h3>
          <p>Watching the ledger for missing proof, duplicate spend and anything that should not hit P&amp;L.</p>
          <div className="agent-insight">
            <b>{d.candidateCards.length} transactions still need proof</b>
            <span>{sgd(d.unresolvedSpend)} is deliberately held outside final accounting treatment.</span>
          </div>
          <div className="agent-insight">
            <b>{d.assets.length} capital-asset records detected</b>
            <span>Instalments are separated from operating spend so burn rate stays honest.</span>
          </div>
          <div className="agent-insight">
            <b>{d.reviewMissingEvidence.length} review rows lack a document</b>
            <span>The system will keep these visible until evidence or an explicit exclusion exists.</span>
          </div>
          <button className="agent-prompt">How much did we spend on AI this month?</button>
          <button className="agent-prompt">Show everything without receipts</button>
          <button className="agent-prompt">What does Movara owe the team?</button>
        </div>
      </div>

      <div className="finance-grid two" style={{ marginTop: 12 }}>
        <div className="finance-card">
          <div className="finance-section-head">
            <div>
              <h2>Latest transactions</h2>
              <p>Most recent DBS card activity currently in Finance OS.</p>
            </div>
            <Link href="/finance/transactions" className="doc-link">All transactions →</Link>
          </div>
          <div className="finance-table-wrap">
            <table className="finance-table">
              <thead><tr><th>Date</th><th>Merchant</th><th>Status</th><th>Amount</th></tr></thead>
              <tbody>
                {d.cards.slice(0, 8).map((t) => {
                  const value = Number(t.debit_sgd) - Number(t.credit_sgd);
                  return (
                    <tr key={t.id}>
                      <td className="muted">{shortDate(t.transaction_date)}</td>
                      <td className="primary">{t.merchant_description || '—'}</td>
                      <td><span className={`status ${t.reconciliation_status}`}>{t.reconciliation_status}</span></td>
                      <td className={`money ${value < 0 ? 'in' : 'out'}`}>{sgd(Math.abs(value))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="finance-card pad">
          <div className="finance-section-head" style={{ padding: 0, marginBottom: 12 }}>
            <div><h2>Books health</h2><p>Evidence matching on imported DBS card activity.</p></div>
          </div>
          <div className="health-ring" style={{ ['--value' as any]: d.evidenceCoverage }}>
            <div><strong>{d.evidenceCoverage}%</strong><small>matched</small></div>
          </div>
          <div className="health-list">
            <div className="health-row"><span>Matched card transactions</span><b>{d.matchedCards.length}</b></div>
            <div className="health-row"><span>Needs evidence / decision</span><b>{d.candidateCards.length}</b></div>
            <div className="health-row"><span>Evidence-backed review rows</span><b>{d.reviewWithEvidence.length}</b></div>
            <div className="health-row"><span>Missing document rows</span><b>{d.reviewMissingEvidence.length}</b></div>
            <div className="health-row"><span>Journal entries posted</span><b>0</b></div>
            <div className="health-row"><span>Latest card data</span><b>{shortDate(d.latestDate)}</b></div>
          </div>
        </div>
      </div>
    </>
  );
}
