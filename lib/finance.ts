import type { Project, Expense, Document, ExpenseFreq } from './types';

const FREQ_PER_YEAR: Record<ExpenseFreq, number> = {
  monthly: 12, yearly: 1, quarterly: 4, weekly: 52,
};

export function isRetainer(p: Project | null | undefined): boolean {
  return p?.billing_type === 'retainer-monthly';
}
export function isHybrid(p: Project | null | undefined): boolean {
  return p?.billing_type === 'hybrid';
}
export function hasRetainerPart(p: Project | null | undefined): boolean {
  return isRetainer(p) || isHybrid(p);
}
export function hasOneTimePart(p: Project | null | undefined): boolean {
  return p?.billing_type === 'one-time' || isHybrid(p);
}

export function projectMonthlyAmount(p: Project): number {
  return hasRetainerPart(p) ? Number(p.value ?? 0) : 0;
}

export function projectOneTimeAmount(p: Project): number {
  if (p.billing_type === 'one-time') return Number(p.value ?? 0);
  if (p.billing_type === 'hybrid') return Number(p.one_time_value ?? 0);
  return 0;
}

export function projectAnnualizedValue(p: Project): number {
  return projectOneTimeAmount(p) + projectMonthlyAmount(p) * 12;
}

export function projectMRR(p: Project): number {
  if (!hasRetainerPart(p)) return 0;
  if (p.retainer_status && p.retainer_status !== 'active') return 0;
  const now = Date.now();
  const startTs = p.retainer_start ? new Date(p.retainer_start).getTime() : 0;
  const endTs = p.retainer_end ? new Date(p.retainer_end).getTime() : Infinity;
  if (now < startTs || now > endTs) return 0;
  return projectMonthlyAmount(p);
}

export function retainerAccrual(p: Project, fromTs: number, toTs: number): number {
  if (!hasRetainerPart(p)) return 0;
  if (p.retainer_status === 'paused') return 0;
  const monthly = projectMonthlyAmount(p);
  if (!monthly) return 0;
  const startTs = p.retainer_start ? new Date(p.retainer_start).getTime() : 0;
  const endTs = p.retainer_end
    ? new Date(p.retainer_end).getTime()
    : (p.retainer_status === 'ended' ? 0 : Infinity);
  const overlapStart = Math.max(fromTs, startTs);
  const overlapEnd = Math.min(toTs, endTs);
  if (overlapEnd <= overlapStart) return 0;
  const overlapDays = (overlapEnd - overlapStart) / 86400000;
  return monthly * 12 * (overlapDays / 365);
}

export function expenseYearly(e: Expense): number {
  if (e.status === 'cancelled') return 0;
  if (e.kind === 'subscription' && e.frequency) {
    return Number(e.amount ?? 0) * (FREQ_PER_YEAR[e.frequency] ?? 12);
  }
  return Number(e.amount ?? 0);
}

export function expenseMonthly(e: Expense): number {
  if (e.status === 'cancelled' || e.kind !== 'subscription' || !e.frequency) return 0;
  return Number(e.amount ?? 0) * (FREQ_PER_YEAR[e.frequency] ?? 12) / 12;
}

export function expensesInRange(expenses: Expense[], fromDate: string, toDate: string): number {
  const fromTs = new Date(fromDate).getTime();
  const toTs = new Date(toDate).getTime() + 86399999;
  let total = 0;
  for (const e of expenses) {
    if (e.kind === 'one-time') {
      if (e.expense_date) {
        const t = new Date(e.expense_date).getTime();
        if (t >= fromTs && t <= toTs) total += Number(e.amount ?? 0);
      }
    } else {
      if (e.status === 'cancelled') continue;
      const startTs = e.start_date ? new Date(e.start_date).getTime() : 0;
      const endTs = e.end_date ? new Date(e.end_date).getTime() : Infinity;
      const overlapStart = Math.max(fromTs, startTs);
      const overlapEnd = Math.min(toTs, endTs);
      if (overlapEnd <= overlapStart) continue;
      const overlapDays = (overlapEnd - overlapStart) / 86400000;
      total += expenseYearly(e) * (overlapDays / 365);
    }
  }
  return total;
}

export function revenueInRange(
  projects: Project[],
  documents: Document[],
  fromDate: string,
  toDate: string
): number {
  const fromTs = new Date(fromDate).getTime();
  const toTs = new Date(toDate).getTime() + 86399999;

  // Paid invoices for non-pure-retainer projects
  const invoiceRev = documents
    .filter(d => {
      if (d.kind !== 'invoice' || d.status !== 'Paid') return false;
      const t = d.date ? new Date(d.date).getTime() : 0;
      if (t < fromTs || t > toTs) return false;
      const proj = projects.find(p => p.id === d.project_id);
      return !isRetainer(proj ?? null);
    })
    .reduce((s, d) => s + Number(d.total ?? 0), 0);

  // Retainer accrual
  const retainerRev = projects.reduce(
    (s, p) => s + retainerAccrual(p, fromTs, toTs),
    0
  );

  return invoiceRev + retainerRev;
}

export function totalProjectMRR(projects: Project[]): number {
  return projects.reduce((s, p) => s + projectMRR(p), 0);
}

export function totalMonthlySubs(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + expenseMonthly(e), 0);
}

export function projectFinancials(
  project: Project,
  allDocuments: Document[],
  allExpenses: Expense[]
) {
  const docs = allDocuments.filter(d => d.project_id === project.id && d.kind === 'invoice');
  const paidInvoices = docs.filter(d => d.status === 'Paid').reduce((s, d) => s + Number(d.total ?? 0), 0);
  const billed = docs.reduce((s, d) => s + Number(d.total ?? 0), 0);

  let oneTimeRev = 0;
  let recurring = 0;

  if (isRetainer(project)) {
    const now = Date.now();
    const startTs = project.retainer_start ? new Date(project.retainer_start).getTime() : now;
    const endTs = project.retainer_end ? new Date(project.retainer_end).getTime() : now;
    const horizonEnd = project.retainer_status === 'ended' ? endTs : now;
    recurring = retainerAccrual(project, startTs, Math.max(startTs, horizonEnd));
  } else if (isHybrid(project)) {
    oneTimeRev = paidInvoices;
    const now = Date.now();
    const startTs = project.retainer_start ? new Date(project.retainer_start).getTime() : now;
    const endTs = project.retainer_end ? new Date(project.retainer_end).getTime() : now;
    const horizonEnd = project.retainer_status === 'ended' ? endTs : now;
    recurring = retainerAccrual(project, startTs, Math.max(startTs, horizonEnd));
  } else {
    oneTimeRev = paidInvoices;
  }

  const revenue = oneTimeRev + recurring;
  const expenses = allExpenses.filter(e => e.project_id === project.id);
  const allocatedCost = expenses.reduce(
    (s, e) => s + (e.kind === 'subscription' ? expenseYearly(e) : Number(e.amount ?? 0)),
    0
  );
  const profit = revenue - allocatedCost;
  const roi = allocatedCost > 0 ? (profit / allocatedCost) * 100 : null;

  return { revenue, oneTimeRev, recurring, paidInvoices, billed, allocatedCost, profit, roi };
}

export function periodPresets() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const qs = Math.floor(m / 3) * 3;
  return {
    'this-month': { label: 'This month', from: fmt(new Date(y, m, 1)), to: fmt(new Date(y, m + 1, 0)) },
    'last-month': { label: 'Last month', from: fmt(new Date(y, m - 1, 1)), to: fmt(new Date(y, m, 0)) },
    'this-quarter': { label: 'This quarter', from: fmt(new Date(y, qs, 1)), to: fmt(new Date(y, qs + 3, 0)) },
    ytd: { label: 'Year to date', from: fmt(new Date(y, 0, 1)), to: fmt(now) },
    'last-12': { label: 'Last 12 months', from: fmt(new Date(y, m - 11, 1)), to: fmt(now) },
    all: { label: 'All time', from: '1970-01-01', to: fmt(new Date(y + 10, 0, 1)) },
  };
}

export function fmtMoney(n: number | null | undefined, symbol = '$'): string {
  if (n == null || isNaN(n)) return symbol + '0';
  return symbol + Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function fmtDate(d: string | null | undefined): string {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString(); } catch { return d; }
}

export function initials(name: string | null | undefined): string {
  return (name ?? '?').split(' ').slice(0, 2).map(s => s[0] ?? '').join('').toUpperCase();
}
