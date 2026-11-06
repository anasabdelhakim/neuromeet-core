/**
 * FRONTEND PRACTICE LAYOUT
 * ─────────────────────────
 * This wraps all your practice pages with a simple container.
 * You can add a nav, sidebar, or any shared UI here.
 *
 * All pages inside (practice)/ are accessible at:
 *   http://localhost:3000/practice/...
 *
 * The (practice) folder name uses Next.js "route groups" — the
 * parentheses mean the folder name is NOT part of the URL.
 * So (practice)/hello/page.tsx → /hello (NOT /practice/hello)
 * But we'll name things with "practice-" prefix to keep it clear.
 */
export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <div
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: '#1a1a2e',
          color: '#7C3AED',
          borderRadius: '8px',
          fontSize: '0.8rem',
        }}
      >
        🧪 PRACTICE ZONE — This page is not part of the real app
      </div>
      {children}
    </div>
  );
}
