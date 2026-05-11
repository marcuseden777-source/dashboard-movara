'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DataClient() {
  const supabase = createClient();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');

  async function exportData() {
    setExporting(true);
    const [clients, projects, tasks, expenses, docs, settings] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('documents').select('*'),
      supabase.from('settings').select('*').single(),
    ]);
    const blob = new Blob([JSON.stringify({
      exportedAt: new Date().toISOString(),
      clients: clients.data,
      projects: projects.data,
      tasks: tasks.data,
      expenses: expenses.data,
      documents: docs.data,
      settings: settings.data,
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movara-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult('');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const results: string[] = [];

      for (const table of ['clients', 'projects', 'tasks', 'expenses', 'documents'] as const) {
        if (Array.isArray(data[table]) && data[table].length > 0) {
          const { error } = await supabase.from(table).upsert(data[table], { onConflict: 'id' });
          if (error) results.push(`${table}: ✗ ${error.message}`);
          else results.push(`${table}: ✓ ${data[table].length} rows`);
        }
      }
      setImportResult(results.join('\n'));
    } catch (err) {
      setImportResult(`Error: ${String(err)}`);
    }
    setImporting(false);
    e.target.value = '';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 560 }}>
      <div className="card">
        <h2 className="section-title">Export</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Download all your data as a JSON file — clients, projects, tasks, expenses, documents, and settings.
        </p>
        <button className="btn btn-primary" onClick={exportData} disabled={exporting}>
          {exporting ? 'Exporting…' : '⤓ Export All Data'}
        </button>
      </div>

      <div className="card">
        <h2 className="section-title">Import</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Upload a previously exported JSON file to restore or merge data. Existing records with the same ID will be updated.
        </p>
        <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
          {importing ? 'Importing…' : '↑ Choose JSON File'}
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={importFile} disabled={importing} />
        </label>
        {importResult && (
          <pre style={{ marginTop: 16, padding: 12, background: 'var(--surface)', borderRadius: 8, fontSize: 13 }}>
            {importResult}
          </pre>
        )}
      </div>
    </div>
  );
}
