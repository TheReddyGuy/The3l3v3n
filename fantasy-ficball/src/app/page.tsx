export default function HomePage() {
  return (
    <main className="space-y-4">
      <div className="rounded border p-4">
        <h2 className="mb-2 text-lg font-semibold">Welcome</h2>
        <p className="text-sm text-gray-700">
          This is the Fantasy FicBall backend UI. Use the admin pages to manage
          leagues, teams, players, and scoring.
        </p>
      </div>
      <nav className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { href: '/api/health', label: 'Health (API)' },
          { href: '/api/leagues', label: 'Leagues (API)' },
          { href: '/api/teams', label: 'Teams (API)' },
          { href: '/api/players', label: 'Players (API)' },
          { href: '/api/stats', label: 'Stats (API)' },
          { href: '/api/scoring', label: 'Scoring (API)' }
        ].map((l) => (
          <a key={l.href} href={l.href} className="rounded border p-3 hover:bg-gray-50">
            {l.label}
          </a>
        ))}
      </nav>
    </main>
  );
}
