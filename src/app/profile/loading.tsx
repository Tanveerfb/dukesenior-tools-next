export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Header card */}
      <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark overflow-hidden mb-6">
        <div className="skeleton h-44 w-full" />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between" style={{ marginTop: -48 }}>
            <div className="skeleton rounded-full border-4 border-card dark:border-card-dark" style={{ width: 96, height: 96 }} />
            <div className="skeleton rounded-lg" style={{ width: 110, height: 34, marginBottom: 4 }} />
          </div>
          <div className="mt-3 space-y-2">
            <div className="skeleton rounded" style={{ width: 180, height: 28 }} />
            <div className="skeleton rounded" style={{ width: 120, height: 16 }} />
            <div className="skeleton rounded" style={{ width: "55%", height: 14 }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          {[160, 120].map((h, i) => (
            <div key={i} className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-5">
              <div className="skeleton rounded mb-4" style={{ width: 140, height: 22 }} />
              <div className="skeleton rounded" style={{ height: h }} />
            </div>
          ))}
        </div>
        <aside className="md:col-span-4 space-y-4">
          {[140, 110, 80].map((h, i) => (
            <div key={i} className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-5">
              <div className="skeleton rounded mb-4" style={{ width: 90, height: 22 }} />
              <div className="skeleton rounded" style={{ height: h }} />
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
