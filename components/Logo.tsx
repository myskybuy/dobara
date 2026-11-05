/** Brand mark + wordmark; place inside an element with className="logo".
 *  The mark is a loop arrow ("dobara" = again) circling an item: a thing getting its second life. */
export function Logo({ tagline = false }: { tagline?: boolean }) {
  return (
    <>
      <span className="logo-m" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="100%" height="100%">
          <circle className="logo-ring" cx="20" cy="20" r="3.6" fill="none" stroke="#FFD27A" strokeWidth="1.4" />
          <g className="logo-loop">
            <path className="logo-arc" d="M24.5 12.2A9 9 0 1 1 15.5 12.2" pathLength={1} fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
            <path className="logo-head" d="M18.1 10.7 13.6 10.1 16.4 14.9Z" fill="#fff" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
          </g>
          <circle className="logo-core" cx="20" cy="20" r="3.6" fill="#F2A93B" />
        </svg>
      </span>
      <span className="logo-w">
        <span>do<em>bara</em><i className="logo-dot" /></span>
        {tagline && <small>pre-loved · again</small>}
      </span>
    </>
  );
}
