import DataClient from './DataClient';

export default function DataPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Import / Export</h1>
      </div>
      <DataClient />
    </div>
  );
}
