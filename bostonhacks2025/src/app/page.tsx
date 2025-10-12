import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white p-8" style={{backgroundColor: 'var(--background)'}}>
      <main className="w-full max-w-4xl shadow-md rounded-lg p-10 card" style={{backgroundColor: 'var(--surface)'}}>
        <header className="mb-6">
          <h1 className="text-4xl font-bold">BudgetBuddy</h1>
          <p className="mt-2 text-muted">Helping people build healthy money habits  one week at a time.</p>
        </header>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Our mission</h2>
          <p className="text-foreground/90">
            We help people who are struggling with budgeting by turning confusing finances into simple, weekly actions.
            Our product uses clear budgeting rules, friendly reminders, and gamification to motivate lasting change. Earn
            points, build streaks, and celebrate progress — budgeting should be empowering, not overwhelming.
          </p>
        </section>

        <section className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/create-budget" className="w-full py-3 rounded btn-primary font-medium text-center">Create a new budget</Link>
          <Link href="/budget" className="w-full py-3 rounded border border-slate-300 text-muted hover:bg-slate-50 text-center">Get Budget</Link>
          <Link href="/ai-assistant" className="w-full py-3 rounded bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-center flex items-center justify-center gap-2">
            <span>🤖</span> AI Assistant
          </Link>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">How it works</h3>
          <ol className="list-decimal pl-6 space-y-2 text-muted">
            <li>Enter your monthly income and goals.</li>
            <li>We split your money into needs, wants, and savings using proven rules.</li>
            <li>Follow your weekly targets to earn points and keep your streak alive.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
