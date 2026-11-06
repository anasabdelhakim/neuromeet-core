import { Suspense } from "react";

async function getHelloFromBackend() {
  const res = await fetch(
    `${process.env.NESTJS_URL || 'http://localhost:4000/api/v1'}/practice/hello`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error(`Backend returned ${res.status}`);
  }

  return res.json();
}

async function PracticeContent() {
  const data = await getHelloFromBackend();

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1rem',
        background: '#0f0f23',
        borderRadius: '8px',
        color: '#a0aec0',
      }}
    >
      <p style={{ color: '#68d391' }}>✅ Backend responded:</p>
      <pre style={{ color: 'white', marginTop: '0.5rem' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function PracticeHelloPage() {
  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '1.5rem' }}>
        Practice #1 — Server Component + API Call
      </h1>
      <Suspense fallback={<div style={{ color: '#a0aec0', marginTop: '1rem' }}>Loading practice data...</div>}>
        <PracticeContent />
      </Suspense>
    </div>
  );
}
