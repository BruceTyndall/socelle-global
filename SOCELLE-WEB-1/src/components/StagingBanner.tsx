/**
 * StagingBanner — renders only when VITE_TEST_MODE=true
 *
 * Non-dismissable. Fixed to top of viewport above all content.
 * Pushed into the deploy build only for release/* and develop branches.
 * Production builds receive VITE_TEST_MODE=false (default), so this
 * component renders nothing in prod.
 *
 * Doc Gate policy: this banner must remain visible on all staging surfaces
 * until Doc Gate PASS is issued and GO LIVE is confirmed by owner.
 */

const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

export function StagingBanner() {
  if (!IS_TEST_MODE) return null;

  const branch = import.meta.env.VITE_DEPLOY_BRANCH ?? 'release/rc-2026-03-06';
  const sha    = import.meta.env.VITE_DEPLOY_SHA    ?? 'unknown';

  return (
    <>
      {/* Spacer so page content is not hidden behind the fixed banner */}
      <div style={{ height: 40 }} aria-hidden="true" />

      <div
        role="status"
        aria-live="polite"
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          right:           0,
          zIndex:          99999,
          height:          40,
          backgroundColor: '#92400e',   /* amber-800 */
          color:           '#fef3c7',   /* amber-100 */
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          gap:             16,
          fontSize:        12,
          fontFamily:      'ui-monospace, SFMono-Regular, Menlo, monospace',
          letterSpacing:   '0.06em',
          userSelect:      'none',
          pointerEvents:   'none',
        }}
      >
        <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>
          ⚠ TEST MODE
        </span>
        <span style={{ opacity: 0.7 }}>|</span>
        <span>NOT approved for public launch</span>
        <span style={{ opacity: 0.7 }}>|</span>
        <span style={{ color: '#fca5a5' }}>Doc Gate FAIL 4 active</span>
        <span style={{ opacity: 0.7 }}>|</span>
        <span style={{ opacity: 0.6 }}>
          {branch} @ {sha.slice(0, 7)}
        </span>
      </div>
    </>
  );
}
