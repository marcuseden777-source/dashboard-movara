import Link from 'next/link';
import { MovaraMark } from '@/components/brand/MovaraMark';
import { getFinanceData, monthLabel, sgd, shortDate } from '@/lib/finance-os';

export default async function FinanceOverviewPage() {
  const d = await getFinanceData();
  const maxSupplier = Math.max(...d.suppliers.slice(0, 7).map((x) => x.amount), 1);

  return (
    <>
      {d.connectionError && (
        <div className="review-callout">
          <div>
            <strong>Finance data connection needs attention.</strong>
            <p>{d.connectionError}</p>
          </div>
          <div className="review-count">!</div>
        </div>
      )}

      <div className="finance-alignment-strip">
        <div>
          <span>Books status</span>
          <b>{d.finalPnlReady ? 'Aligned and posted' : 'Draft — reconciliation in progress'}</b>
        </div>
        <div>
          <span>Coverage</span>
          <b>{d.reconciliationCoverage}% of imported transactions matched</b>
        </div>
        <div>
          <span>Current period</span>
          <b>{shortDate(d.incorporatedOn)} – {shortDate(d.latestDate)}</b>
        </div>
        <div className="alignment-actions">
          <Link href="/finance/pnl">Open P&amp;L</Link>
          <Link href="/finance/review">Books status</Link>
        </div>
      </div>

      <div className="finance-grid metrics">
        <div className="finance-card metric">
          <div className="metric-label">Cash position</div>
          <div className="metric-value">{sgd(d.cashPosition)}</div>
          <div className="metric-sub">Imported OCBC ledger position through {shortDate(d.alignment.bank_period_end)}</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Recorded revenue</div>
          <div className="metric-value">{sgd(d.draftRevenue)}</div>
          <div className="metric-sub">{sgd(d.reconciledRevenue)} is directly linked to OCBC references</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Draft net result</div>
          <div className={`metric-value ${d.draftNet >= 0 ? 'good' : 'warn'}`}>{sgd(d.draftNet)}</div>
          <div className="metric-sub">Recorded revenue less legacy expenses; not yet a posted P&amp;L</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Unresolved card spend</div>
          <div className="metric-value warn">{sgd(d.unresolvedSpend)}</div>
          <div className="metric-sub">{d.candidateCards.length} DBS transactions need evidence or a decision</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Claims in review</div>
          <div className="metric-value">{sgd(d.claimsReviewTotal)}</div>
          <div className="metric-sub">{d.claimsReview.length} claims not yet approved or reimbursed</div>
        </div>
      </div>

      <div className="finance-grid two" style={{ marginTop: 12 }}>
        <div className="finance-card">
          <div className="finance-section-head">
            <div>
              <h2>Spend intelligence</h2>
              <p>Personal-funded review ledger grouped by supplier. Review data, not final P&amp;L.</p>
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
          <div className="finance-mini-summary">
            <div><span>{monthLabel(d.latestMonth)} operating spend</span><b>{sgd(d.monthOperatingSpend)}</b></div>
            <div><span>Capital-asset payments</span><b>{sgd(d.monthAssetPayments)}</b></div>
          </div>
        </div>

        <div className="finance-card finance-agent">
          <div className="agent-mark"><MovaraMark /></div>
          <h3>Finance Agent</h3>
          <p>Watching the ledger for missing proof, duplicate spend and anything that should not hit P&amp;L.</p>
          <div className="agent-insight">
            <b>{d.reviewBank.length} OCBC items still need classification</b>
            <span>Funding, transfers and unclear payments remain outside the final P&amp;L.</span>
          </div>
          <div className="agent-insight">
            <b>{d.candidateCards.length} DBS transactions still need proof</b>
            <span>{sgd(d.unresolvedSpend)} is deliberately held outside final accounting treatment.</span>
          </div>
          <div className="agent-insight">
            <b>{d.reviewMissingEvidence.length} review rows lack a document</b>
            <span>The system keeps these visible until evidence or an explicit exclusion exists.</span>
          </div>
          <Link href="/finance/review" className="agent-prompt">Open the complete books-status queue →</Link>
          <Link href="/finance/pnl" className="agent-prompt">Review the draft P&amp;L →</Link>
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
            <div><h2>Books health</h2><p>Combined OCBC and DBS reconciliation coverage.</p></div>
          </div>
          <div className="health-ring" style={{ ['--value' as any]: d.reconciliationCoverage }}>
            <div><strong>{d.reconciliationCoverage}%</strong><small>matched</small></div>
          </div>
          <div className="health-list">
            <div className="health-row"><span>OCBC matched</span><b>{d.matchedBank.length} / {d.bank.length}</b></div>
            <div className="health-row"><span>DBS matched</span><b>{d.matchedCards.length} / {d.cards.length}</b></div>
            <div className="health-row"><span>Evidence-backed review rows</span><b>{d.reviewWithEvidence.length}</b></div>
            <div className="health-row"><span>Missing document rows</span><b>{d.reviewMissingEvidence.length}</b></div>
            <div className="health-row"><span>Journal entries posted</span><b>{Number(d.alignment.posted_journals || 0)}</b></div>
            <div className="health-row"><span>Latest card data</span><b>{shortDate(d.latestDate)}</b></div>
          </div>
        </div>
      </div>
    </>
  );
}
