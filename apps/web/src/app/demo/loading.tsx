export default function DemoLoading() {
  return (
    <main className="px-6 pb-20 pt-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-44 animate-pulse rounded-[2rem] border border-white/10 bg-white/4" />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="h-96 animate-pulse rounded-[2rem] border border-white/10 bg-white/4" />
          <div className="h-96 animate-pulse rounded-[2rem] border border-white/10 bg-white/4" />
        </div>
      </div>
    </main>
  );
}
