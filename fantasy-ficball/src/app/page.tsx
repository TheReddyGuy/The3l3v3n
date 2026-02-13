'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';

type Player = {
  id: number;
  name: string;
  contact: number;
  power: number;
  speed: number;
  defense: number;
  clutch: number;
  imageUrl?: string;
};

type PlayEvent = {
  inning: number;
  text: string;
  player?: Player;
};

type GameResult = {
  game: number;
  opponentSkill: number;
  teamRuns: number;
  opponentRuns: number;
  won: boolean;
  playByPlay: PlayEvent[];
};

const skillLabel = (value: number) => {
  if (value >= 85) return 'Elite';
  if (value >= 70) return 'Great';
  if (value >= 55) return 'Solid';
  if (value >= 40) return 'Developing';
  return 'Raw';
};

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickWeightedPlayer = (players: Player[]) => {
  const weights = players.map((player) =>
    player.contact + player.power + player.speed + player.defense + player.clutch
  );
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (!totalWeight) return players[randomInt(0, players.length - 1)];

  let roll = Math.random() * totalWeight;
  for (let i = 0; i < players.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return players[i];
  }
  return players[players.length - 1];
};

const describePlay = (player: Player, playPower: number, offense: boolean) => {
  if (offense) {
    if (playPower > 90) return `${player.name} launches a towering home run to dead center!`;
    if (playPower > 76) return `${player.name} laces a rocket into the gap and brings in a run.`;
    if (playPower > 62) return `${player.name} slaps a clutch single to keep the inning alive.`;
    if (playPower > 48) return `${player.name} works a patient at-bat and reaches base safely.`;
    return `${player.name} battles hard but gets retired this time.`;
  }

  if (playPower > 88) return `${player.name} makes a full-extension diving grab to steal extra bases!`;
  if (playPower > 72) return `${player.name} flashes leather with a smooth defensive stop.`;
  if (playPower > 58) return `${player.name} keeps the runner close and limits the damage.`;
  return `${player.name} is hustling, but the opponent scratches across a run.`;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to load image.'));
    reader.readAsDataURL(file);
  });

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [gamesToPlay, setGamesToPlay] = useState(5);
  const [teamName, setTeamName] = useState('Skyline Sparks');

  const [newPlayer, setNewPlayer] = useState<Omit<Player, 'id'>>({
    name: '',
    contact: 60,
    power: 60,
    speed: 60,
    defense: 60,
    clutch: 60
  });

  const teamRating = useMemo(() => {
    if (!players.length) return 0;
    const playerTotals = players.map(
      (player) => player.contact + player.power + player.speed + player.defense + player.clutch
    );
    return Math.round(playerTotals.reduce((sum, score) => sum + score, 0) / (players.length * 5));
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
        id: Date.now(),
        name: newPlayer.name.trim(),
        imageUrl
      }
    ]);

    setNewPlayer({
      name: '',
      contact: 60,
      power: 60,
      speed: 60,
      defense: 60,
      clutch: 60
    });
    event.currentTarget.reset();
  };

  const simulateSeason = () => {
    if (!players.length) return;

    const nextResults: GameResult[] = [];
    for (let game = 1; game <= gamesToPlay; game += 1) {
      const opponentSkill = randomInt(45, 95);
      const offenseEdge = Math.max(0, teamRating - opponentSkill + randomInt(-8, 15));
      const defenseEdge = Math.max(0, teamRating - opponentSkill + randomInt(-10, 12));
      const teamRuns = randomInt(1, 3) + Math.floor(offenseEdge / 12);
      const opponentRuns = randomInt(1, 4) + Math.floor(Math.max(0, opponentSkill - defenseEdge) / 20);

      const playByPlay: PlayEvent[] = [];
      for (let inning = 1; inning <= 6; inning += 1) {
        const star = pickWeightedPlayer(players);
        const offensePower =
          star.contact * 0.28 +
          star.power * 0.28 +
          star.speed * 0.16 +
          star.clutch * 0.28 +
          randomInt(-12, 12);

        const defensePower =
          star.defense * 0.44 + star.speed * 0.24 + star.clutch * 0.22 + randomInt(-15, 10);

        const useOffense = inning % 2 === 1;
        playByPlay.push({
          inning,
          player: star,
          text: describePlay(star, useOffense ? offensePower : defensePower, useOffense)
        });
      }

      nextResults.push({
        game,
        opponentSkill,
        teamRuns,
        opponentRuns,
        won: teamRuns >= opponentRuns,
        playByPlay
      });
    }

    setResults(nextResults);
  };

  const wins = results.filter((result) => result.won).length;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Fictional Baseball Story Simulator</h1>
        <p className="mt-2 text-sm text-gray-700">
          Build your team, assign each player a stat profile, upload a JPG headshot, and simulate games
          where skill levels decide your season.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={addPlayer} className="space-y-4 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Add a player</h2>
          <label className="block text-sm font-medium">
            Team Name
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Your team name"
            />
          </label>

          <label className="block text-sm font-medium">
            Player Name
            <input
              value={newPlayer.name}
              onChange={(e) => setNewPlayer((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Riley Storm"
              required
            />
          </label>

          {(['contact', 'power', 'speed', 'defense', 'clutch'] as const).map((stat) => (
            <label key={stat} className="block text-sm font-medium capitalize">
              {stat}: {newPlayer[stat]}
              <input
                type="range"
                min={1}
                max={99}
                value={newPlayer[stat]}
                onChange={(e) =>
                  setNewPlayer((prev) => ({
                    ...prev,
                    [stat]: Number(e.target.value)
                  }))
                }
                className="mt-1 w-full"
              />
            </label>
          ))}

          <label className="block text-sm font-medium">
            Character image (JPG/PNG)
            <input name="image" type="file" accept="image/jpeg,image/jpg,image/png" className="mt-1 w-full" />
          </label>

          <button type="submit" className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
            Add Player
          </button>
        </form>

        <div className="space-y-4 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Team dashboard</h2>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{teamName}</span> rating: {teamRating} ({skillLabel(teamRating)})
          </p>
          <label className="block text-sm font-medium">
            Games to simulate
            <input
              type="number"
              min={1}
              max={30}
              value={gamesToPlay}
              onChange={(e) => setGamesToPlay(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={simulateSeason}
            disabled={!players.length}
            className="rounded bg-emerald-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Simulate Games
          </button>
          {!!results.length && (
            <p className="rounded bg-emerald-50 p-3 text-sm">
              Final record: <span className="font-bold">{wins}-{results.length - wins}</span>
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {players.map((player) => (
          <article key={player.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {player.imageUrl ? (
                <Image src={player.imageUrl} alt={player.name} width={64} height={64} unoptimized className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-sm">
                  No Img
                </div>
              )}
              <div>
                <h3 className="font-semibold">{player.name}</h3>
                <p className="text-xs text-gray-600">
                  C {player.contact} • P {player.power} • S {player.speed} • D {player.defense} • CL {player.clutch}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        {results.map((result) => (
          <article key={result.game} className="rounded-lg border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">
              Game {result.game}: {teamName} {result.teamRuns} - {result.opponentRuns} Opponent ({result.won ? 'Win' : 'Loss'})
            </h3>
            <p className="mb-3 text-xs text-gray-500">Opponent skill level: {result.opponentSkill}</p>
            <ul className="space-y-3">
              {result.playByPlay.map((play) => (
                <li key={`${result.game}-${play.inning}-${play.text}`} className="flex items-center gap-3 rounded border p-3">
                  {play.player?.imageUrl ? (
                    <Image src={play.player.imageUrl} alt={play.player.name} width={48} height={48} unoptimized className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs">Player</div>
                  )}
                  <p className="text-sm">
                    <span className="font-semibold">Inning {play.inning}:</span> {play.text}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
