import { getFinanceData, shortDate } from '@/lib/finance-os';

export default async function DocumentsPage() {
  const d = await getFinanceData();

  return (
    <div className="finance-card">
      <div className="finance-section-head">
        <div><h2>Finance evidence register</h2><p>Formal documents registered in Finance OS. Drive remains the underlying archive.</p></div>
        <div className="big">{d.documents.length}</div>
      </div>
      <div className="finance-table-wrap">
        <table className="finance-table">
          <thead><tr><th>Added</th><th>Document</th><th>Type</th><th>Provider</th><th>Source</th></tr></thead>
          <tbody>
            {d.documents.map((doc) => (
              <tr key={doc.id}>
                <td className="muted">{shortDate(doc.created_at)}</td>
                <td className="primary">{doc.title}</td>
                <td>{doc.document_type}</td>
                <td className="muted">{doc.provider}</td>
                <td><a className="doc-link" href={doc.external_ref} target="_blank" rel="noreferrer">Open ↗</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
