export interface LandingPageProps {
  onStartDaily: () => void;
  onStartRandom: () => void;
}

export function LandingPage({ onStartDaily, onStartRandom }: LandingPageProps) {
  return (
    <section className="flex flex-col items-center gap-8 py-16">
      <header className="text-center">
        <h1 className="text-7xl font-brush tracking-wide text-[#f0e6d2]">
          诗乐
        </h1>
        <p className="mt-3 text-[#9a8870] italic">猜诗句的字谜游戏</p>
      </header>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onStartDaily} className="btn-primary">
          今日诗题
        </button>
        <button onClick={onStartRandom} className="btn-secondary">
          随机一题
        </button>
      </div>
    </section>
  );
}
