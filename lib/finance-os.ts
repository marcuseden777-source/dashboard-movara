import { createClient as createFinanceClient } from '@supabase/supabase-js';

export type FinanceBankTx = {
  id: string;
  bank_account_label: string;
  transaction_date: string;
  amount: number | string;
  description: string;
  external_ref: string | null;
  reconciliation_status: 'unmatched' | 'matched' | 'excluded';
  classification?: string | null;
  accounting_treatment?: string | null;
  confidence?: number | string | null;
  evidence_status?: string | null;
  classification_review_status?: string | null;
  business_purpose?: string | null;
  classification_notes?: string | null;
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

export type FinanceRevenueEntry = {
  id: string;
  type: string;
  description: string;
  amount: number | string;
  received_at: string | null;
  source: string | null;
  external_ref: string | null;
  receipt_url: string | null;
  created_at: string;
};

export type LegacyExpense = {
  id: string;
  category: string | null;
  description: string;
  amount: number | string;
  paid_at: string | null;
  receipt_url: string | null;
  notes: string | null;
  source: string | null;
  external_ref: string | null;
  created_at: string;
};

export type BooksAlignment = {
  bank_period_start: string | null;
  bank_period_end: string | null;
  bank_transactions: number | string;
  bank_matched: number | string;
  bank_needs_review: number | string;
  card_period_start: string | null;
  card_period_end: string | null;
  card_transactions: number | string;
  card_matched: number | string;
  card_needs_review: number | string;
  bank_reconciled_revenue: number | string;
  other_recorded_revenue: number | string;
  legacy_recorded_expenses: number | string;
  evidenced_expenses_in_review: number | string;
  missing_evidence_amount: number | string;
  posted_journals: number | string;
  total_journals: number | string;
};

export type DraftPnlMonth = {
  month: string;
  recordedRevenue: number;
  reconciledRevenue: number;
  otherRevenue: number;
  legacyExpenses: number;
  draftNet: number;
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
  if (!key) return 'Current period';
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-SG', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

const emptyAlignment: BooksAlignment = {
  bank_period_start: null,
  bank_period_end: null,
  bank_transactions: 0,
  bank_matched: 0,
  bank_needs_review: 0,
  card_period_start: null,
  card_period_end: null,
  card_transactions: 0,
  card_matched: 0,
  card_needs_review: 0,
  bank_reconciled_revenue: 0,
  other_recorded_revenue: 0,
  legacy_recorded_expenses: 0,
  evidenced_expenses_in_review: 0,
  missing_evidence_amount: 0,
  posted_journals: 0,
  total_journals: 0,
};

export async function getFinanceData() {
  const financeUrl = process.env.FINANCE_SUPABASE_URL;
  const financeKey = process.env.FINANCE_SUPABASE_PUBLISHABLE_KEY;
  const bridgeToken = process.env.FINANCE_BRIDGE_TOKEN;

  let snapshot: unknown = null;
  let connectionError: string | null = null;

  if (!financeUrl || !financeKey || !bridgeToken) {
    connectionError = 'The secure Finance OS bridge is not configured in this environment.';
  } else {
    const finance = createFinanceClient(financeUrl, financeKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { data, error } = await finance.rpc('get_movara_finance_bridge_snapshot', {
      p_token: bridgeToken,
    });
    snapshot = data;
    if (error) connectionError = `Finance OS bridge unavailable: ${error.message}`;
  }

  const raw = (snapshot ?? {}) as {
    bank?: FinanceBankTx[];
    cards?: FinanceCardTx[];
    claims?: FinanceClaim[];
    parties?: FinanceParty[];
    documents?: FinanceDocument[];
    reviews?: PersonalReview[];
    revenue_entries?: FinanceRevenueEntry[];
    legacy_expenses?: LegacyExpense[];
    alignment?: BooksAlignment;
    incorporated_on?: string;
  };

  const bank = raw.bank ?? [];
  const cards = raw.cards ?? [];
  const claims = raw.claims ?? [];
  const parties = raw.parties ?? [];
  const documents = raw.documents ?? [];
  const reviews = raw.reviews ?? [];
  const revenueEntries = raw.revenue_entries ?? [];
  const legacyExpenses = raw.legacy_expenses ?? [];
  const alignment = raw.alignment ?? emptyAlignment;
  const incorporatedOn = raw.incorporated_on ?? '2026-06-09';

  const latestDate = cards
    .map((t) => t.transaction_date)
    .filter((x): x is string => Boolean(x))
    .sort()
    .at(-1) ?? alignment.card_period_end ?? new Date().toISOString().slice(0, 10);
  const latestMonth = latestDate.slice(0, 7);

  const monthCards = cards.filter((t) => t.transaction_date?.startsWith(latestMonth));
  const cashPosition = bank.reduce((sum, t) => sum + n(t.amount), 0);
  const matchedCards = cards.filter((t) => t.reconciliation_status === 'matched');
  const candidateCards = cards.filter((t) => t.reconciliation_status === 'candidate');
  const excludedCards = cards.filter((t) => t.reconciliation_status === 'excluded');
  const matchedBank = bank.filter((t) => t.reconciliation_status === 'matched');
  const reviewBank = bank.filter((t) => t.classification_review_status === 'needs_review');

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

  const postIncorporationRevenue = revenueEntries.filter((row) => !row.received_at || row.received_at >= incorporatedOn);
  const postIncorporationLegacyExpenses = legacyExpenses.filter((row) => !row.paid_at || row.paid_at >= incorporatedOn);
  const preIncorporationLegacyExpenses = legacyExpenses.filter((row) => row.paid_at && row.paid_at < incorporatedOn);

  const draftRevenue = postIncorporationRevenue.reduce((sum, row) => sum + n(row.amount), 0);
  const reconciledRevenue = postIncorporationRevenue
    .filter((row) => row.source === 'ocbc_reconciliation')
    .reduce((sum, row) => sum + n(row.amount), 0);
  const otherRecordedRevenue = draftRevenue - reconciledRevenue;
  const legacyRecordedExpenses = postIncorporationLegacyExpenses.reduce((sum, row) => sum + n(row.amount), 0);
  const draftNet = draftRevenue - legacyRecordedExpenses;

  const monthlyMap = new Map<string, DraftPnlMonth>();
  function monthRow(key: string) {
    const existing = monthlyMap.get(key);
    if (existing) return existing;
    const created: DraftPnlMonth = {
      month: key,
      recordedRevenue: 0,
      reconciledRevenue: 0,
      otherRevenue: 0,
      legacyExpenses: 0,
      draftNet: 0,
    };
    monthlyMap.set(key, created);
    return created;
  }
  for (const row of postIncorporationRevenue) {
    if (!row.received_at) continue;
    const target = monthRow(row.received_at.slice(0, 7));
    target.recordedRevenue += n(row.amount);
    if (row.source === 'ocbc_reconciliation') target.reconciledRevenue += n(row.amount);
    else target.otherRevenue += n(row.amount);
  }
  for (const row of postIncorporationLegacyExpenses) {
    if (!row.paid_at) continue;
    monthRow(row.paid_at.slice(0, 7)).legacyExpenses += n(row.amount);
  }
  const draftPnlMonths = Array.from(monthlyMap.values())
    .map((row) => ({ ...row, draftNet: row.recordedRevenue - row.legacyExpenses }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const partyById = Object.fromEntries(parties.map((p) => [p.id, p]));
  const cardEvidenceCoverage = cards.length ? Math.round((matchedCards.length / cards.length) * 100) : 0;
  const bankReconciliationCoverage = bank.length ? Math.round((matchedBank.length / bank.length) * 100) : 0;
  const transactionTotal = bank.length + cards.length;
  const reconciliationCoverage = transactionTotal
    ? Math.round(((matchedBank.length + matchedCards.length) / transactionTotal) * 100)
    : 0;
  const reviewDocumentCoverage = reviewWithEvidence.length + reviewMissingEvidence.length
    ? Math.round((reviewWithEvidence.length / (reviewWithEvidence.length + reviewMissingEvidence.length)) * 100)
    : 0;

  const finalPnlReady =
    reviewBank.length === 0 &&
    candidateCards.length === 0 &&
    reviewMissingEvidence.length === 0 &&
    n(alignment.posted_journals) > 0;

  return {
    bank,
    cards,
    claims,
    parties,
    documents,
    reviews,
    revenueEntries,
    legacyExpenses,
    alignment,
    incorporatedOn,
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
    matchedBank,
    reviewBank,
    claimsReview,
    claimsReviewTotal,
    reviewWithEvidence,
    reviewMissingEvidence,
    reviewExcluded,
    postIncorporationRevenue,
    postIncorporationLegacyExpenses,
    preIncorporationLegacyExpenses,
    draftRevenue,
    reconciledRevenue,
    otherRecordedRevenue,
    legacyRecordedExpenses,
    draftNet,
    draftPnlMonths,
    cardEvidenceCoverage,
    bankReconciliationCoverage,
    reconciliationCoverage,
    reviewDocumentCoverage,
    finalPnlReady,
    connectionError,
  };
}
