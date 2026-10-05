import type { Step } from '@/lib/orders';
import { fmtDateTime } from '@/lib/format';

export function Timeline({ steps }: { steps: Step[] }) {
  return (
    <div className="tl">
      {steps.map((s) => (
        <div key={s.title} className={s.state === 'done' ? 'tl-i done' : s.state === 'now' ? 'tl-i now' : 'tl-i'}>
          <span className="tl-dot"><i className={'ic xs i-' + (s.state === 'done' ? 'check' : 'dot')} /></span>
          <div className="row between start g8">
            <div className="col g4" style={{ gap: 0 }}>
              <span className="tl-t">{s.title}</span>
              <span className="t-xs muted">{s.desc}</span>
            </div>
            <span className="t-xs muted" style={{ whiteSpace: 'nowrap' }}>{s.at ? fmtDateTime(s.at) : ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
