'use client';

import { useMemo, useState } from 'react';

type TransactionStatus = 'matched' | 'candidate' | 'unmatched' | 'excluded';

export type FinanceTransactionRow = {
  id: string;
  date: string | null;
  source: 'OCBC' | 'DBS Card';
  account: string;
  description: string;
  category: string;
  treatment: string;
  status: TransactionStatus;
  amount: number;
  direction: 'in' | 'out';
  reference?: string | null;
};

function sgd(value: number) {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
  }).format(value);
}

function shortDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00+08:00`));
}

function displayStatus(status: TransactionStatus) {
  if (status === 'matched') return 'Matched';
  if (status === 'excluded') return 'Excluded';
  return 'Needs review';
}

export default function TransactionsExplorer({ rows }: { rows: FinanceTransactionRow[] }) {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'all' | 'OCBC' | 'DBS Card'>('all');
  const [status, setStatus] = useState<'all' | 'matched' | 'review' | 'excluded'>('all');
  const [direction, setDirection] = useState<'all' | 'in' | 'out'>('all');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const statusMatches =
        status === 'all' ||
        (status === 'review' && (row.status === 'candidate' || row.status === 'unmatched')) ||
        row.status === status;
      const queryMatches = !needle || [
        row.description,
        row.category,
        row.treatment,
        row.account,
        row.reference ?? '',
      ].join(' ').toLowerCase().includes(needle);
      return (
        queryMatches &&
        (source === 'all' || row.source === source) &&
        statusMatches &&
        (direction === 'all' || row.direction === direction)
      );
    });
  }, [direction, query, rows, source, status]);

  const incoming = filtered
    .filter((row) => row.direction === 'in')
    .reduce((sum, row) => sum + row.amount, 0);
  const outgoing = filtered
    .filter((row) => row.direction === 'out')
    .reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="finance-card transaction-explorer">
      <div className="finance-section-head">
        <div>
          <h2>Master transaction ledger</h2>
          <p>OCBC and DBS card activity in one searchable audit trail.</p>
        </div>
        <div className="big">{filtered.length}</div>
      </div>

      <div className="transaction-filterbar">
        <input
          aria-label="Search transactions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search merchant, purpose, category or reference"
        />
        <select aria-label="Transaction source" value={source} onChange={(event) => setSource(event.target.value as typeof source)}>
          <option value="all">All sources</option>
          <option value="OCBC">OCBC bank</option>
          <option value="DBS Card">DBS card</option>
        </select>
        <select aria-label="Transaction status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
          <option value="all">All statuses</option>
          <option value="matched">Matched</option>
          <option value="review">Needs review</option>
          <option value="excluded">Excluded</option>
        </select>
        <select aria-label="Cash direction" value={direction} onChange={(event) => setDirection(event.target.value as typeof direction)}>
          <option value="all">Money in &amp; out</option>
          <option value="in">Money in</option>
          <option value="out">Money out</option>
        </select>
      </div>

      <div className="transaction-summary">
        <div><span>Visible money in</span><b className="money in">{sgd(incoming)}</b></div>
        <div><span>Visible money out</span><b className="money out">{sgd(outgoing)}</b></div>
        <div><span>Net movement</span><b className={`money ${incoming - outgoing >= 0 ? 'in' : 'out'}`}>{sgd(incoming - outgoing)}</b></div>
      </div>

      <div className="finance-table-wrap">
        <table className="finance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Source</th>
              <th>Description</th>
              <th>Classification</th>
              <th>Treatment</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={`${row.source}-${row.id}`}>
                <td className="muted">{shortDate(row.date)}</td>
                <td><span className="source-pill">{row.source}</span></td>
                <td className="primary" title={row.description}>{row.description}</td>
                <td className="muted">{row.category}</td>
                <td className="muted">{row.treatment}</td>
                <td><span className={`status ${row.status}`}>{displayStatus(row.status)}</span></td>
                <td className={`money ${row.direction === 'in' ? 'in' : 'out'}`}>
                  {row.direction === 'in' ? '+' : '−'}{sgd(row.amount)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="transaction-empty">No transactions match those filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
