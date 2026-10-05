export default function Loading() {
  return (
    <div className="container col g20" style={{ paddingTop: 28, paddingBottom: 48 }} aria-busy="true" aria-label="Loading">
      <div className="sk" style={{ height: 32, width: 280 }} />
      <div className="pgrid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card" style={{ overflow: 'hidden' }}>
            <div className="sk" style={{ aspectRatio: '4/3', borderRadius: 0 }} />
            <div className="col g8" style={{ padding: 14 }}><div className="sk" style={{ height: 12, width: '90%' }} /><div className="sk" style={{ height: 12, width: '60%' }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
