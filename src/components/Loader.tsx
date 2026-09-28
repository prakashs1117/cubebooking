export default function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3F1]">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-4 rounded-full border-[3px] border-[#E6E2DE] border-t-[#772432] animate-spin" />
        <p className="text-[13.5px] font-semibold text-[#6B6470]">{label}</p>
      </div>
    </div>
  )
}
