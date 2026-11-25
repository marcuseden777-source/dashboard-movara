import TransactionsExplorer, { type FinanceTransactionRow } from '@/components/finance/TransactionsExplorer';
import { getFinanceData } from '@/lib/finance-os';

export default async function TransactionsPage() {
  const d = await getFinanceData();

  const rows: FinanceTransactionRow[] = [
    ...d.cards.map((t) => ({
      id: t.id,
      date: t.transaction_date,
      source: 'DBS Card' as const,
      account: t.card_account_label || 'DBS card',
      description: t.merchant_description || '—',
      category: t.proposed_category || 'Uncategorised',
      treatment: (t.proposed_category || '').toLowerCase().includes('capital asset')
        ? 'Capital asset payment'
        : 'Expense review',
      status: t.reconciliation_status,
      amount: Math.abs(Number(t.debit_sgd) - Number(t.credit_sgd)),
      direction: Number(t.debit_sgd) - Number(t.credit_sgd) >= 0 ? 'out' as const : 'in' as const,
      reference: t.id,
    })),
    ...d.bank.map((t) => ({
      id: t.id,
      date: t.transaction_date,
      source: 'OCBC' as const,
      account: t.bank_account_label || 'OCBC bank',
      description: t.description,
      category: t.classification || 'Needs classification',
      treatment: t.accounting_treatment || 'Review',
      status: t.reconciliation_status,
      amount: Math.abs(Number(t.amount)),
      direction: Number(t.amount) >= 0 ? 'in' as const : 'out' as const,
      reference: t.external_ref,
    })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return <TransactionsExplorer rows={rows} />;
}
