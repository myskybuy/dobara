const STEPS = ['Pickup or delivery', 'Confirm & pay', 'Done'];

export function CheckoutSteps({ at }: { at: 0 | 1 | 2 }) {
  return (
    <div style={{ background: 'var(--sf)', borderBottom: '1px solid var(--line)' }}>
      <div className="container" style={{ paddingTop: 14, paddingBottom: 14 }}>
        <div className="steps" style={{ overflowX: 'auto' }}>
          {STEPS.map((l, i) => (
            <div key={l} style={{ display: 'contents' }}>
              <div className={i < at ? 'step done' : i === at ? 'step on' : 'step'}>
                <span className="step-n">{i < at ? <i className="ic xs i-check" /> : i + 1}</span>
                <span className="hide-m">{l}</span>
              </div>
              {i < STEPS.length - 1 && <div className={i < at ? 'step-bar done' : 'step-bar'} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
