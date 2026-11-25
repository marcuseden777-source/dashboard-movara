import { getFinanceData, monthLabel, sgd } from '@/lib/finance-os';

export default async function FinancePnlPage() {
  const d = await getFinanceData();
  const preIncorporationTotal = d.preIncorporationLegacyExpenses.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );
  const blockers = d.reviewBank.length + d.candidateCards.length + d.reviewMissingEvidence.length;

  return (
    <>
      <div className={`pnl-status ${d.finalPnlReady ? 'ready' : 'draft'}`}>
        <div>
          <div className="pnl-status-label">{d.finalPnlReady ? 'FINAL BOOKS' : 'DRAFT P&L'}</div>
          <strong>{d.finalPnlReady ? 'The reporting period is ready.' : 'Useful for management, not yet final for filing.'}</strong>
          <p>
            {d.finalPnlReady
              ? 'All imported transactions are reconciled and posted.'
              : `${blockers} review items remain and no final journals have been posted. The figures below are deliberately labelled as draft.`}
          </p>
        </div>
        <div className="pnl-status-mark">{d.finalPnlReady ? '✓' : 'D'}</div>
      </div>

      <div className="finance-grid pnl-grid">
        <div className="finance-card metric">
          <div className="metric-label">Recorded revenue</div>
          <div className="metric-value">{sgd(d.draftRevenue)}</div>
          <div className="metric-sub">Revenue entries dated on or after incorporation</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">OCBC-reconciled revenue</div>
          <div className="metric-value good">{sgd(d.reconciledRevenue)}</div>
          <div className="metric-sub">Revenue linked directly to imported bank references</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Legacy recorded expenses</div>
          <div className="metric-value">{sgd(d.legacyRecordedExpenses)}</div>
          <div className="metric-sub">Existing expense ledger after incorporation; duplicate review still applies</div>
        </div>
        <div className="finance-card metric">
          <div className="metric-label">Draft net result</div>
          <div className={`metric-value ${d.draftNet >= 0 ? 'good' : 'warn'}`}>{sgd(d.draftNet)}</div>
          <div className="metric-sub">Recorded revenue less the legacy expense ledger — not a posted accounting result</div>
        </div>
      </div>

      <div className="finance-grid two" style={{ marginTop: 12 }}>
        <div className="finance-card">
          <div className="finance-section-head">
            <div>
              <h2>Monthly draft P&amp;L</h2>
              <p>Built only from dated revenue entries and the legacy expense ledger after 9 June 2026.</p>
            </div>
          </div>
          <div className="finance-table-wrap">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Recorded revenue</th>
                  <th>Bank-reconciled</th>
                  <th>Other recorded</th>
                  <th>Legacy expenses</th>
                  <th>Draft net</th>
                </tr>
              </thead>
              <tbody>
                {d.draftPnlMonths.map((row) => (
                  <tr key={row.month}>
                    <td className="primary">{monthLabel(row.month)}</td>
                    <td className="money in">{sgd(row.recordedRevenue)}</td>
                    <td className="money">{sgd(row.reconciledRevenue)}</td>
                    <td className="money">{sgd(row.otherRevenue)}</td>
                    <td className="money">{sgd(row.legacyExpenses)}</td>
                    <td className={`money ${row.draftNet >= 0 ? 'in' : 'out'}`}>{sgd(row.draftNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="finance-card pnl-scope-card">
          <div className="finance-section-head">
            <div>
              <h2>What this draft includes</h2>
              <p>The system keeps uncertain amounts outside the result instead of hiding them.</p>
            </div>
          </div>
          <div className="pnl-scope-list">
            <div><span>Included</span><b>{d.postIncorporationRevenue.length} recorded revenue entries</b></div>
            <div><span>Included</span><b>{d.postIncorporationLegacyExpenses.length} legacy expense records</b></div>
            <div><span>Separate review pool</span><b>{sgd(Number(d.alignment.evidenced_expenses_in_review || 0))}</b></div>
            <div><span>Missing evidence</span><b>{sgd(Number(d.alignment.missing_evidence_amount || 0))}</b></div>
            <div><span>Pre-incorporation</span><b>{d.preIncorporationLegacyExpenses.length} records · {sgd(preIncorporationTotal)}</b></div>
            <div><span>Posted journals</span><b>{Number(d.alignment.posted_journals || 0)}</b></div>
          </div>
          <div className="pnl-note">
            The final P&amp;L will replace this view once duplicate cleanup, transaction classification and journal approval are complete.
          </div>
        </div>
      </div>
    </>
  );
}
