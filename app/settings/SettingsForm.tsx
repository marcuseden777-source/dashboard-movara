'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Settings } from '@/lib/types';

interface Props { settings: Settings | null }

export default function SettingsForm({ settings }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    company_name: settings?.company_name ?? '',
    company_tagline: settings?.company_tagline ?? '',
    company_email: settings?.company_email ?? '',
    company_phone: settings?.company_phone ?? '',
    company_website: settings?.company_website ?? '',
    company_address: settings?.company_address ?? '',
    currency_symbol: settings?.currency_symbol ?? '$',
    tax_rate: String(settings?.tax_rate ?? 0),
    invoice_prefix: settings?.invoice_prefix ?? 'INV',
    quote_prefix: settings?.quote_prefix ?? 'QUO',
    payment_terms: settings?.payment_terms ?? 'Net 30',
    bank_details: settings?.bank_details ?? '',
    brand_voice: settings?.brand_voice ?? '',
    default_model_fast: settings?.default_model_fast ?? 'claude-haiku-4.5',
    default_model_smart: settings?.default_model_smart ?? 'claude-sonnet-4.6',
    content_pillars: (settings?.content_pillars ?? []).join('\n'),
    default_hashtags: (settings?.default_hashtags ?? []).join(' '),
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      company_name: form.company_name,
      company_tagline: form.company_tagline,
      company_email: form.company_email,
      company_phone: form.company_phone,
      company_website: form.company_website,
      company_address: form.company_address,
      currency_symbol: form.currency_symbol,
      tax_rate: parseFloat(form.tax_rate) || 0,
      invoice_prefix: form.invoice_prefix,
      quote_prefix: form.quote_prefix,
      payment_terms: form.payment_terms,
      bank_details: form.bank_details,
      brand_voice: form.brand_voice,
      default_model_fast: form.default_model_fast,
      default_model_smart: form.default_model_smart,
      content_pillars: form.content_pillars.split('\n').map(s => s.trim()).filter(Boolean),
      default_hashtags: form.default_hashtags.split(/\s+/).map(s => s.trim()).filter(Boolean),
    };
    await supabase.from('settings').upsert(payload);
    setSaved(true);
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={save}>
      <div className="settings-sections">
        <section className="card">
          <h2 className="section-title">Company</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-input" value={form.company_name} onChange={e => set('company_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input className="form-input" value={form.company_tagline} onChange={e => set('company_tagline', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.company_email} onChange={e => set('company_email', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.company_phone} onChange={e => set('company_phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-input" value={form.company_website} onChange={e => set('company_website', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-input" rows={2} value={form.company_address} onChange={e => set('company_address', e.target.value)} />
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Finance</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <input className="form-input" value={form.currency_symbol} onChange={e => set('currency_symbol', e.target.value)} style={{ width: 60 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Default Tax Rate (%)</label>
              <input className="form-input" type="number" min="0" step="0.1" value={form.tax_rate} onChange={e => set('tax_rate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Invoice Prefix</label>
              <input className="form-input" value={form.invoice_prefix} onChange={e => set('invoice_prefix', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Quote Prefix</label>
              <input className="form-input" value={form.quote_prefix} onChange={e => set('quote_prefix', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Terms</label>
            <input className="form-input" value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Bank Details</label>
            <textarea className="form-input" rows={3} value={form.bank_details} onChange={e => set('bank_details', e.target.value)} />
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">AI Content</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fast Model</label>
              <input className="form-input" value={form.default_model_fast} onChange={e => set('default_model_fast', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Smart Model</label>
              <input className="form-input" value={form.default_model_smart} onChange={e => set('default_model_smart', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Brand Voice</label>
            <textarea className="form-input" rows={3}
              placeholder="Describe your brand's tone and communication style..."
              value={form.brand_voice} onChange={e => set('brand_voice', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Content Pillars (one per line)</label>
            <textarea className="form-input" rows={4}
              placeholder="AI Automation&#10;Agency Growth&#10;Client Results"
              value={form.content_pillars} onChange={e => set('content_pillars', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Default Hashtags (space-separated)</label>
            <input className="form-input"
              placeholder="#AIAgency #Automation #DigitalMarketing"
              value={form.default_hashtags} onChange={e => set('default_hashtags', e.target.value)} />
          </div>
        </section>
      </div>

      <div className="form-actions" style={{ marginTop: 16 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <span className="muted" style={{ color: 'var(--success)' }}>✓ Saved</span>}
      </div>
    </form>
  );
}
