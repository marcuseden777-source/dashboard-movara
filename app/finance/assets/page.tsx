import { getFinanceData, sgd, shortDate } from '@/lib/finance-os';

export default async function AssetsPage() {
  const d = await getFinanceData();

  function assetName(description: string | null) {
    return (description || 'Asset').split('—')[0].trim();
  }

  return (
    <>
      <div className="review-callout">
        <div>
          <strong>Capital assets stay outside operating burn.</strong>
          <p>Monthly instalments are repayments against the original asset purchase, not fresh monthly expenses.</p>
        </div>
        <div className="review-count">{d.assets.length}</div>
      </div>

      <div className="asset-grid">
        {d.assets.map((asset) => {
          const notes = asset.notes || '';
          const instalment = notes.match(/S\$([\d,.]+) \/ (\d+)/i);
          return (
            <article className="finance-card asset-card" key={asset.id}>
              <div className="asset-type">CAPITAL ASSET</div>
              <h3>{assetName(asset.description)}</h3>
              <div className="asset-price">{sgd(Number(asset.amount || 0))}</div>
              <div className="asset-meta">
                <div><span>Purchase date</span><b>{shortDate(asset.transaction_date)}</b></div>
                <div><span>Funded by</span><b>{asset.funded_by || '—'}</b></div>
                <div><span>Evidence</span><b>{asset.document_url ? 'Linked' : 'Missing'}</b></div>
                <div><span>Treatment</span><b>Asset review</b></div>
              </div>
              {asset.document_url && <a className="doc-link" href={asset.document_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 13 }}>Open source document ↗</a>}
            </article>
          );
        })}
      </div>
    </>
  );
}
