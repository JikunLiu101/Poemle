export interface LandingPageProps {
  onStartDaily: () => void;
  onStartRandom: () => void;
}

export function LandingPage({ onStartDaily, onStartRandom }: LandingPageProps) {
  return (
    <section className="flex flex-col items-center gap-8 py-16">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-wide">詩樂</h1>
        <p className="mt-2 text-[#818384]">猜詩句的字謎遊戲</p>
      </header>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onStartDaily} className="btn-primary">
          今日詩題
        </button>
        <button onClick={onStartRandom} className="btn-secondary">
          隨機一題
        </button>
      </div>
    </section>
  );
}
