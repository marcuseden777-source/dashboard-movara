'use client';
import { useState } from 'react';
import { fmtMoney, revenueInRange, expensesInRange } from '@/lib/finance';
import type { Project, Expense, Document } from '@/lib/types';

interface Props {
  projects: Project[];
  expenses: Expense[];
  documents: Document[];
  presets: Record<string, { label: string; from: string; to: string }>;
}

export default function PnlClient({ projects, expenses, documents, presets }: Props) {
  const keys = Object.keys(presets);
  const [period, setPeriod] = useState('this-month');
  const [custom, setCustom] = useState({ from: '', to: '' });

  const preset = presets[period];
  const from = period === 'custom' ? custom.from : preset?.from ?? '';
  const to = period === 'custom' ? custom.to : preset?.to ?? '';

  const revenue = from && to ? revenueInRange(projects, documents, from, to) : 0;
  const costs = from && to ? expensesInRange(expenses, from, to) : 0;
  const profit = revenue - costs;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return (
    <div style={{ marginTop: 24 }}>
      <div className="filters">
        <div className="filter-group">
          {keys.map(k => (
            <button key={k} className={`filter-btn${period === k ? ' active' : ''}`} onClick={() => setPeriod(k)}>
              {presets[k].label}
            </button>
          ))}
          <button className={`filter-btn${period === 'custom' ? ' active' : ''}`} onClick={() => setPeriod('custom')}>
            Custom
          </button>
        </div>
        {period === 'custom' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="form-input" type="date" value={custom.from} onChange={e => setCustom(c => ({ ...c, from: e.target.value }))} style={{ width: 140 }} />
            <span className="muted">to</span>
            <input className="form-input" type="date" value={custom.to} onChange={e => setCustom(c => ({ ...c, to: e.target.value }))} style={{ width: 140 }} />
          </div>
        )}
      </div>

      {from && to && (
        <div className="pnl-table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-section-header"><td colSpan={2}>Revenue</td></tr>
              <tr>
                <td>Project Revenue</td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(revenue)}</td>
              </tr>
              <tr className="table-total">
                <td>Total Revenue</td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(revenue)}</td>
              </tr>
              <tr className="table-section-header"><td colSpan={2}>Expenses</td></tr>
              <tr>
                <td>Operating Costs</td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(costs)}</td>
              </tr>
              <tr className="table-total">
                <td>Total Expenses</td>
                <td style={{ textAlign: 'right' }}>{fmtMoney(costs)}</td>
              </tr>
              <tr className="table-grand-total">
                <td>Net Profit</td>
                <td style={{ textAlign: 'right', color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {fmtMoney(profit)}
                </td>
              </tr>
              <tr>
                <td className="muted">Profit Margin</td>
                <td style={{ textAlign: 'right' }} className="muted">{margin.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
