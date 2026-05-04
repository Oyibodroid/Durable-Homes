// app/loading.tsx — global loading UI
export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        .spin { animation:spin 0.8s linear infinite; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
      `}</style>
      <div className="min-h-screen bg-[#111008] hex-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    </>
  )
}