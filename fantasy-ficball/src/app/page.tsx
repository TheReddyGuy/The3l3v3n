'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';

type Position = 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'DH';

type Player = {
  id: number;
  name: string;
  nickname: string;
  position: Position;
  contact: number;
  power: number;
  speed: number;
  defense: number;
  clutch: number;
  stamina: number;
  imageUrl?: string;
};

type PlayEvent = {
  inning: number;
  text: string;
  impact: 'good' | 'neutral' | 'bad';
  player?: Player;
};

type GameResult = {
  game: number;
  opponentName: string;
  opponentSkill: number;
  weather: string;
  teamRuns: number;
  opponentRuns: number;
  won: boolean;
  mvp?: Player;
  playByPlay: PlayEvent[];
};

const positions: Position[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];
const weathers = ['Sunny', 'Cloudy', 'Windy', 'Drizzle', 'Night Lights'];
const opponents = ['Iron Wolves', 'Thunder Owls', 'Harbor Kings', 'Metro Meteors', 'Desert Foxes'];

const clamp = (value: number) => Math.min(99, Math.max(1, value));
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const skillLabel = (value: number) => {
  if (value >= 86) return 'Championship Caliber';
  if (value >= 74) return 'Contender';
  if (value >= 60) return 'On the Rise';
  if (value >= 45) return 'Rebuilding';
  return 'Development Squad';
};

const average = (numbers: number[]) => Math.round(numbers.reduce((sum, n) => sum + n, 0) / numbers.length);

const getPlayerRating = (player: Player) =>
  Math.round((player.contact + player.power + player.speed + player.defense + player.clutch + player.stamina) / 6);

const describePlay = (player: Player, score: number, offense: boolean): PlayEvent => {
  if (offense) {
    if (score > 90) {
      return { text: `${player.nickname} (${player.name}) crushes a moonshot into the upper deck!`, impact: 'good', player, inning: 0 };
    }
    if (score > 75) {
      return { text: `${player.name} roasts the line for an RBI double and ignites the dugout.`, impact: 'good', player, inning: 0 };
    }
    if (score > 60) {
      return { text: `${player.name} slaps a single through the infield and keeps the rally alive.`, impact: 'neutral', player, inning: 0 };
    }
    if (score > 45) {
      return { text: `${player.name} draws a tough walk after a disciplined at-bat.`, impact: 'neutral', player, inning: 0 };
    }
    return { text: `${player.name} makes loud contact, but it dies at the warning track.`, impact: 'bad', player, inning: 0 };
  }

  if (score > 87) {
    return { text: `${player.name} makes a highlight-reel diving stop and robs extra bases!`, impact: 'good', player, inning: 0 };
  }
  if (score > 72) {
    return { text: `${player.name} fields it cleanly and turns a smooth out.`, impact: 'neutral', player, inning: 0 };
  }
  if (score > 55) {
    return { text: `${player.name} limits damage with smart positioning.`, impact: 'neutral', player, inning: 0 };
  }
  return { text: `${player.name} misplays the hop and the opposition sneaks in a run.`, impact: 'bad', player, inning: 0 };
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to load image.'));
    reader.readAsDataURL(file);
  });

const pickWeightedPlayer = (players: Player[], modifier: (player: Player) => number) => {
  const weights = players.map((player) => Math.max(1, modifier(player)));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;

  for (let i = 0; i < players.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return players[i];
  }

  return players[players.length - 1];
};

export default function HomePage() {
  const [teamName, setTeamName] = useState('Skyline Sparks');
  const [teamMotto, setTeamMotto] = useState('Play Fast. Stay Loud.');
  const [gamesToPlay, setGamesToPlay] = useState(6);
  const [players, setPlayers] = useState<Player[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);

  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({
    name: '',
    nickname: '',
    position: 'CF',
    contact: 60,
    power: 60,
    speed: 60,
    defense: 60,
    clutch: 60,
    stamina: 60
  });

  const teamRating = useMemo(() => {
    if (!players.length) return 0;
    return average(players.map((player) => getPlayerRating(player)));
  }, [players]);

  const chemistry = useMemo(() => {
    if (players.length < 2) return 50;
    const clutchAvg = average(players.map((player) => player.clutch));
    const staminaAvg = average(players.map((player) => player.stamina));
    return Math.round((clutchAvg * 0.6 + staminaAvg * 0.4 + Math.min(players.length, 12)) / 1.2);
  }, [players]);

  const wins = results.filter((result) => result.won).length;
  const losses = results.length - wins;

  const bestPlayer = useMemo(() => {
    if (!players.length) return undefined;
    return [...players].sort((a, b) => getPlayerRating(b) - getPlayerRating(a))[0];
  }, [players]);

  const addPlayer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPlayer.name.trim()) return;

    const fileInput = event.currentTarget.elements.namedItem('image') as HTMLInputElement;
    let imageUrl: string | undefined;

    if (fileInput?.files?.[0]) {
      imageUrl = await readFileAsDataUrl(fileInput.files[0]);
    }

    setPlayers((prev) => [
      ...prev,
      {
        ...newPlayer,
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: newPlayer.name.trim(),
        nickname: newPlayer.nickname.trim() || 'Rookie',
        imageUrl
      }
    ]);

    setNewPlayer({
      name: '',
      nickname: '',
      position: 'CF',
      contact: 60,
      power: 60,
      speed: 60,
      defense: 60,
      clutch: 60,
      stamina: 60
    });

    event.currentTarget.reset();
  };

  const removePlayer = (id: number) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  };

  const simulateSeason = () => {
    if (!players.length) return;

    const seasonResults: GameResult[] = [];

    for (let game = 1; game <= gamesToPlay; game += 1) {
      const opponentSkill = randomInt(48, 94);
      const weather = weathers[randomInt(0, weathers.length - 1)];
      const opponentName = opponents[randomInt(0, opponents.length - 1)];

      const offenseBoost = Math.round((teamRating + chemistry) / 11) + randomInt(-2, 3);
      const defenseBoost = Math.round((teamRating + chemistry) / 13) + randomInt(-3, 2);

      const teamRuns = Math.max(0, randomInt(2, 5) + Math.floor((teamRating + offenseBoost - opponentSkill) / 8));
      const opponentRuns = Math.max(0, randomInt(1, 5) + Math.floor((opponentSkill - defenseBoost - teamRating) / 10));

      const playByPlay: PlayEvent[] = [];

      for (let inning = 1; inning <= 9; inning += 1) {
        const offensiveStar = pickWeightedPlayer(players, (player) => player.contact + player.power + player.clutch);
        const defensiveStar = pickWeightedPlayer(players, (player) => player.defense + player.speed + player.stamina);

        const offenseRoll =
          offensiveStar.contact * 0.3 +
          offensiveStar.power * 0.3 +
          offensiveStar.clutch * 0.25 +
          offensiveStar.speed * 0.15 +
          randomInt(-12, 12);

        const defenseRoll =
          defensiveStar.defense * 0.4 +
          defensiveStar.speed * 0.25 +
          defensiveStar.stamina * 0.2 +
          defensiveStar.clutch * 0.15 +
          randomInt(-12, 10);

        const offenseEvent = describePlay(offensiveStar, offenseRoll, true);
        offenseEvent.inning = inning;

        const defenseEvent = describePlay(defensiveStar, defenseRoll, false);
        defenseEvent.inning = inning;

        playByPlay.push(offenseEvent);
        playByPlay.push(defenseEvent);
      }

      const mvp = pickWeightedPlayer(players, (player) => getPlayerRating(player) + player.clutch);

      seasonResults.push({
        game,
        opponentName,
        opponentSkill,
        weather,
        teamRuns,
        opponentRuns,
        won: teamRuns >= opponentRuns,
        mvp,
        playByPlay
      });
    }

    setResults(seasonResults);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-blue-500/30 bg-slate-900/70 p-6 shadow-2xl shadow-blue-900/40 backdrop-blur">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-cyan-300">Fantasy FicBall Studio</p>
          <h1 className="text-3xl font-black sm:text-4xl">Build Your Club. Simulate Legendary Games.</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Give players custom stat profiles, upload portraits, and run a cinematic season simulation with play-by-play stories.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
          <form onSubmit={addPlayer} className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold text-cyan-200">Team Setup & New Player</h2>
            <label className="block text-sm">
              Team Name
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              Team Motto
              <input
                value={teamMotto}
                onChange={(e) => setTeamMotto(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Player Name
                <input
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2"
                  placeholder="Riley Storm"
                  required
                />
              </label>
              <label className="text-sm">
                Nickname
                <input
                  value={newPlayer.nickname}
                  onChange={(e) => setNewPlayer((prev) => ({ ...prev, nickname: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2"
                  placeholder="The Rocket"
                />
              </label>
            </div>

            <label className="block text-sm">
              Position
              <select
                value={newPlayer.position}
                onChange={(e) => setNewPlayer((prev) => ({ ...prev, position: e.target.value as Position }))}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2"
              >
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </label>

            {(['contact', 'power', 'speed', 'defense', 'clutch', 'stamina'] as const).map((stat) => (
              <label key={stat} className="block text-sm capitalize">
                {stat}: <span className="font-semibold text-cyan-300">{newPlayer[stat]}</span>
                <input
                  type="range"
                  min={1}
                  max={99}
                  value={newPlayer[stat]}
                  onChange={(e) =>
                    setNewPlayer((prev) => ({
                      ...prev,
                      [stat]: clamp(Number(e.target.value))
                    }))
                  }
                  className="mt-1 w-full accent-cyan-400"
                />
              </label>
            ))}

            <label className="block text-sm">
              Character image (JPG/PNG)
              <input name="image" type="file" accept="image/jpeg,image/jpg,image/png" className="mt-1 w-full text-xs" />
            </label>

            <button type="submit" className="w-full rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400">
              Add Player to Roster
            </button>
          </form>

          <div className="space-y-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold text-cyan-200">{teamName}</h2>
            <p className="text-sm italic text-slate-300">“{teamMotto}”</p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                <p className="text-xs uppercase text-slate-400">Team Rating</p>
                <p className="text-2xl font-bold text-cyan-300">{teamRating}</p>
                <p className="text-xs text-slate-400">{skillLabel(teamRating)}</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                <p className="text-xs uppercase text-slate-400">Chemistry</p>
                <p className="text-2xl font-bold text-violet-300">{chemistry}</p>
                <p className="text-xs text-slate-400">Boosts momentum</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                <p className="text-xs uppercase text-slate-400">Current Record</p>
                <p className="text-2xl font-bold text-emerald-300">
                  {wins}-{losses}
                </p>
                <p className="text-xs text-slate-400">{results.length ? 'Simulated season' : 'No games yet'}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                Games to Simulate
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={gamesToPlay}
                  onChange={(e) => setGamesToPlay(clamp(Number(e.target.value) || 1))}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2"
                />
              </label>
              <button
                type="button"
                disabled={!players.length}
                onClick={simulateSeason}
                className="mt-auto rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                Simulate Season
              </button>
            </div>

            {bestPlayer && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                ⭐ Club Star: <span className="font-semibold">{bestPlayer.name}</span> ({bestPlayer.position}) with a rating of{' '}
                <span className="font-semibold">{getPlayerRating(bestPlayer)}</span>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <article key={player.id} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4 shadow-lg">
              <div className="flex items-center gap-3">
                {player.imageUrl ? (
                  <Image
                    src={player.imageUrl}
                    alt={player.name}
                    width={72}
                    height={72}
                    unoptimized
                    className="h-[72px] w-[72px] rounded-full border border-slate-600 object-cover"
                  />
                ) : (
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-xs">
                    No Img
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{player.name}</h3>
                  <p className="text-xs text-slate-400">“{player.nickname}” · {player.position}</p>
                  <p className="text-xs text-cyan-300">Overall {getPlayerRating(player)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-300">
                C {player.contact} · P {player.power} · S {player.speed} · D {player.defense} · CL {player.clutch} · STA {player.stamina}
              </p>
              <button
                type="button"
                onClick={() => removePlayer(player.id)}
                className="mt-3 rounded-md border border-rose-500/50 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
              >
                Remove
              </button>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          {results.map((result) => (
            <article key={result.game} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5 shadow-lg">
              <h3 className="text-xl font-bold">
                Game {result.game}: {teamName} {result.teamRuns} - {result.opponentRuns} {result.opponentName}{' '}
                <span className={result.won ? 'text-emerald-300' : 'text-rose-300'}>({result.won ? 'Win' : 'Loss'})</span>
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Opponent Skill {result.opponentSkill} · Weather {result.weather} · MVP {result.mvp?.name ?? 'N/A'}
              </p>
              <ul className="mt-4 grid gap-2">
                {result.playByPlay.slice(0, 8).map((play) => (
                  <li key={`${result.game}-${play.inning}-${play.text}`} className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950/70 p-2">
                    {play.player?.imageUrl ? (
                      <Image
                        src={play.player.imageUrl}
                        alt={play.player.name}
                        width={44}
                        height={44}
                        unoptimized
                        className="h-11 w-11 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-800 text-[10px]">Player</div>
                    )}
                    <p className="text-sm">
                      <span className="font-semibold text-cyan-300">Inning {play.inning}:</span> {play.text}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
