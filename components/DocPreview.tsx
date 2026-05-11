'use client';
import { fmtDate, fmtMoney } from '@/lib/finance';
import type { Document } from '@/lib/types';

interface DocPreviewProps {
  doc: Document;
  companyName: string;
  clientName: string;
}

export default function DocPreview({ doc, companyName, clientName }: DocPreviewProps) {
  const items = doc.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0);
  const tax = subtotal * ((doc.tax_rate ?? 0) / 100);
  const total = subtotal + tax;

  return (
    <div className="doc-preview">
      <div className="doc-header">
        <div>
          <div className="doc-company">{companyName}</div>
          <div className="doc-meta">
            {doc.kind === 'quotation' ? 'QUOTATION' : 'INVOICE'} #{doc.number}
          </div>
        </div>
        <div className="doc-meta-right">
          <div>Date: {fmtDate(doc.date)}</div>
          {doc.due_date && <div>Due: {fmtDate(doc.due_date)}</div>}
        </div>
      </div>

      <div className="doc-bill-to">
        <div className="doc-section-label">Bill To</div>
        <div>{clientName}</div>
      </div>

      <table className="doc-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{fmtMoney(item.rate)}</td>
              <td>{fmtMoney(item.quantity * item.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="doc-totals">
        <div className="doc-total-row">
          <span>Subtotal</span>
          <span>{fmtMoney(subtotal)}</span>
        </div>
        {(doc.tax_rate ?? 0) > 0 && (
          <div className="doc-total-row">
            <span>Tax ({doc.tax_rate}%)</span>
            <span>{fmtMoney(tax)}</span>
          </div>
        )}
        <div className="doc-total-row doc-grand-total">
          <span>Total</span>
          <span>{fmtMoney(total)}</span>
        </div>
      </div>

      {doc.notes && (
        <div className="doc-notes">
          <div className="doc-section-label">Notes</div>
          <p>{doc.notes}</p>
        </div>
      )}
    </div>
  );
}
