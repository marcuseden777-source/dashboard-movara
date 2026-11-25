import { getFinanceData, sgd, shortDate } from '@/lib/finance-os';

export default async function TransactionsPage() {
  const d = await getFinanceData();
  const rows = [
    ...d.cards.map((t) => ({
      id: t.id,
      date: t.transaction_date,
      source: 'DBS Card',
      description: t.merchant_description || '—',
      category: t.proposed_category || 'Uncategorised',
      status: t.reconciliation_status,
      amount: Number(t.debit_sgd) - Number(t.credit_sgd),
    })),
    ...d.bank.map((t) => ({
      id: t.id,
      date: t.transaction_date,
      source: t.bank_account_label || 'Bank',
      description: t.description,
      category: 'Bank transaction',
      status: t.reconciliation_status,
      amount: -Number(t.amount),
    })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <div className="finance-card">
      <div className="finance-section-head">
        <div><h2>Master transaction ledger</h2><p>OCBC + DBS card activity in one audit trail.</p></div>
        <div className="big">{rows.length}</div>
      </div>
      <div className="finance-table-wrap">
        <table className="finance-table">
          <thead><tr><th>Date</th><th>Source</th><th>Description</th><th>Category</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.source}-${row.id}`}>
                <td className="muted">{shortDate(row.date)}</td>
                <td>{row.source}</td>
                <td className="primary">{row.description}</td>
                <td className="muted">{row.category}</td>
                <td><span className={`status ${row.status}`}>{row.status}</span></td>
                <td className={`money ${row.amount < 0 ? 'in' : 'out'}`}>{row.amount < 0 ? '+' : ''}{sgd(Math.abs(row.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
