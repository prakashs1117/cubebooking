export default function PageContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col max-w-2xl lg:max-w-3xl mx-auto w-full pt-4 lg:pt-6 px-5 pb-24 lg:pb-6 ${className}`}
      style={{ fontFamily: 'var(--font-sans)', color: 'var(--foreground)' }}
    >
      {children}
    </div>
  )
}
