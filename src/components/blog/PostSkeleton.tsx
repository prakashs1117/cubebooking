export default function PostSkeleton() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E6E2DE',
      borderRadius: 16,
      padding: '18px 18px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e5e7eb' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 11, width: '40%', borderRadius: 6, background: '#e5e7eb' }} />
          <div style={{ height: 9, width: '25%', borderRadius: 6, background: '#f3f4f6' }} />
        </div>
      </div>
      {/* Title */}
      <div style={{ height: 16, width: '80%', borderRadius: 6, background: '#e5e7eb' }} />
      <div style={{ height: 11, width: '95%', borderRadius: 6, background: '#f3f4f6' }} />
      <div style={{ height: 11, width: '70%', borderRadius: 6, background: '#f3f4f6' }} />
      {/* Footer */}
      <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
        <div style={{ height: 10, width: 50, borderRadius: 6, background: '#e5e7eb' }} />
        <div style={{ height: 10, width: 50, borderRadius: 6, background: '#e5e7eb' }} />
        <div style={{ height: 10, width: 50, borderRadius: 6, background: '#e5e7eb' }} />
      </div>
    </div>
  )
}
