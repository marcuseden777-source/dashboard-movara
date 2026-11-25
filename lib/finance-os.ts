import { createClient } from '@/lib/supabase/server';

export type FinanceBankTx = {
  id: string;
  bank_account_label: string;
  transaction_date: string;
  amount: number | string;
  description: string;
  reconciliation_status: 'unmatched' | 'matched' | 'excluded';
};

export type FinanceCardTx = {
  id: string;
  card_account_label: string;
  transaction_date: string | null;
  merchant_description: string | null;
  debit_sgd: number | string;
  credit_sgd: number | string;
  proposed_category: string | null;
  review_status: string | null;
  paid_by: string | null;
  notes: string | null;
  reconciliation_status: 'unmatched' | 'candidate' | 'matched' | 'excluded';
};

export type FinanceClaim = {
  id: string;
  claimant_id: string;
  description: string;
  amount: number | string;
  currency: string;
  incurred_on: string | null;
  status: string;
  document_id: string | null;
  source_ref: string | null;
  created_at: string;
};

export type FinanceParty = {
  id: string;
  display_name: string;
  kind: string;
};

export type FinanceDocument = {
  id: string;
  title: string;
  provider: string;
  external_ref: string;
  document_type: string;
  created_at: string;
};

export type PersonalReview = {
  id: string;
  supplier: string | null;
  description: string | null;
  transaction_date: string | null;
  amount: number | string | null;
  currency: string | null;
  review_status: string | null;
  reimbursement_status: string | null;
  funded_by: string | null;
  document_url: string | null;
  notes: string | null;
};

const n = (value: number | string | null | undefined) => Number(value ?? 0);

export function sgd(value: number) {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function shortDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value + (value.length === 10 ? 'T00:00:00+08:00' : '')));
}

export function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-SG', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

export async function getFinanceData() {
  const supabase = await createClient();
  const finance = (supabase as any).schema('finance_os');

  const [
    bankRes,
    cardRes,
    claimsRes,
    partiesRes,
    docsRes,
    reviewsRes,
  ] = await Promise.all([
    finance.from('bank_transactions').select('*').order('transaction_date', { ascending: false }),
    finance.from('card_transactions').select('*').order('transaction_date', { ascending: false }),
    finance.from('expense_claims').select('*').order('incurred_on', { ascending: false }),
    finance.from('parties').select('id, display_name, kind'),
    finance.from('documents').select('*').order('created_at', { ascending: false }),
    (supabase as any)
      .from('personal_funded_expense_review')
      .select('id,supplier,description,transaction_date,amount,currency,review_status,reimbursement_status,funded_by,document_url,notes')
      .order('transaction_date', { ascending: false }),
  ]);

  const bank = (bankRes.data ?? []) as FinanceBankTx[];
  const cards = (cardRes.data ?? []) as FinanceCardTx[];
  const claims = (claimsRes.data ?? []) as FinanceClaim[];
  const parties = (partiesRes.data ?? []) as FinanceParty[];
  const documents = (docsRes.data ?? []) as FinanceDocument[];
  const reviews = (reviewsRes.data ?? []) as PersonalReview[];

  const latestDate = cards
    .map((t) => t.transaction_date)
    .filter(Boolean)
    .sort()
    .at(-1) ?? new Date().toISOString().slice(0, 10);
  const latestMonth = latestDate.slice(0, 7);

  const monthCards = cards.filter((t) => t.transaction_date?.startsWith(latestMonth));
  const cashPosition = bank.reduce((sum, t) => sum + n(t.amount), 0);
  const matchedCards = cards.filter((t) => t.reconciliation_status === 'matched');
  const candidateCards = cards.filter((t) => t.reconciliation_status === 'candidate');
  const excludedCards = cards.filter((t) => t.reconciliation_status === 'excluded');

  const netCard = (t: FinanceCardTx) => n(t.debit_sgd) - n(t.credit_sgd);
  const cardSpend = cards.reduce((sum, t) => sum + netCard(t), 0);
  const matchedSpend = matchedCards.reduce((sum, t) => sum + netCard(t), 0);
  const unresolvedSpend = candidateCards.reduce((sum, t) => sum + netCard(t), 0);
  const monthSpend = monthCards.reduce((sum, t) => sum + netCard(t), 0);
  const monthAssetPayments = monthCards
    .filter((t) => (t.proposed_category ?? '').toLowerCase().includes('capital asset'))
    .reduce((sum, t) => sum + netCard(t), 0);
  const monthOperatingSpend = monthCards
    .filter((t) => t.reconciliation_status === 'matched')
    .filter((t) => !(t.proposed_category ?? '').toLowerCase().includes('capital asset'))
    .reduce((sum, t) => sum + netCard(t), 0);

  const claimsReview = claims.filter((c) => c.status === 'review');
  const claimsReviewTotal = claimsReview.reduce((sum, c) => sum + n(c.amount), 0);

  const reviewWithEvidence = reviews.filter((r) => r.review_status === 'pending_reconciliation' && r.document_url);
  const reviewMissingEvidence = reviews.filter((r) => r.review_status === 'pending_reconciliation' && !r.document_url);
  const reviewExcluded = reviews.filter((r) => r.review_status === 'excluded');

  const assets = reviews.filter((r) => {
    const haystack = `${r.description ?? ''} ${r.notes ?? ''}`.toLowerCase();
    return haystack.includes('capital asset') || haystack.includes('capital-asset');
  });

  const supplierMap = new Map<string, { count: number; amount: number; evidenced: number; missing: number }>();
  for (const row of reviews.filter((r) => r.review_status === 'pending_reconciliation')) {
    const supplier = row.supplier || 'Uncategorised';
    const current = supplierMap.get(supplier) ?? { count: 0, amount: 0, evidenced: 0, missing: 0 };
    current.count += 1;
    current.amount += n(row.amount);
    if (row.document_url) current.evidenced += 1;
    else current.missing += 1;
    supplierMap.set(supplier, current);
  }
  const suppliers = Array.from(supplierMap.entries())
    .map(([supplier, values]) => ({ supplier, ...values }))
    .sort((a, b) => b.amount - a.amount);

  const partyById = Object.fromEntries(parties.map((p) => [p.id, p]));
  const evidenceCoverage = cards.length ? Math.round((matchedCards.length / cards.length) * 100) : 0;

  return {
    bank,
    cards,
    claims,
    parties,
    documents,
    reviews,
    assets,
    suppliers,
    partyById,
    latestMonth,
    latestDate,
    cashPosition,
    cardSpend,
    matchedSpend,
    unresolvedSpend,
    monthSpend,
    monthAssetPayments,
    monthOperatingSpend,
    matchedCards,
    candidateCards,
    excludedCards,
    claimsReview,
    claimsReviewTotal,
    reviewWithEvidence,
    reviewMissingEvidence,
    reviewExcluded,
    evidenceCoverage,
  };
}
