'use client';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
      <div className="card empty">
        <div className="empty-ic red"><i className="ic xxl i-alert" /></div>
        <div className="h3">Something went wrong</div>
        <p className="soft">Please try again. If it keeps happening, check that the database is running and see the terminal for details.</p>
        <button className="btn btn-pri" onClick={() => reset()}><i className="ic sm i-refresh" />Try again</button>
      </div>
    </div>
  );
}
