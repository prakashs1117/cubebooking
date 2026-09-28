function Skeleton({
  w,
  h = 12,
  className = '',
}: {
  w: number | string
  h?: number | string
  className?: string
}) {
  return (
    <span
      className={`inline-block rounded-md bg-[#E6E2DE] animate-pulse align-middle ${className}`}
      style={{ width: w, height: h }}
    />
  )
}

export { Skeleton }
