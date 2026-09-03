import { useState, useEffect, useRef } from "react";

type Screen = "onboarding" | "home" | "diary" | "timer";

interface ContractionEntry {
  start: number;
  duration: number;
  interval: number | null;
}

interface DiaryEntry {
  date: string;
  mood: number;
  nausea: number;
  weight: string;
  pressure: string;
  notes: string;
}

function getBabySize(week: number): { name: string; emoji: string; description: string } {
  const sizes: Record<number, { name: string; emoji: string; description: string }> = {
    4: { name: "Semente de Papoula", emoji: "🌱", description: "0,1 cm" },
    5: { name: "Semente de Gergelim", emoji: "🌾", description: "0,2 cm" },
    6: { name: "Ervilha", emoji: "🫛", description: "0,6 cm" },
    7: { name: "Mirtilo", emoji: "🫐", description: "1 cm" },
    8: { name: "Framboesa", emoji: "🍓", description: "1,6 cm" },
    9: { name: "Cereja", emoji: "🍒", description: "2,3 cm" },
    10: { name: "Tâmara", emoji: "🟤", description: "3,1 cm" },
    11: { name: "Figo", emoji: "🫐", description: "4,1 cm" },
    12: { name: "Limão", emoji: "🍋", description: "5,4 cm" },
    13: { name: "Ervilha-torta", emoji: "🫛", description: "7,4 cm" },
    14: { name: "Pêssego", emoji: "🍑", description: "8,7 cm" },
    15: { name: "Maçã", emoji: "🍎", description: "10,1 cm" },
    16: { name: "Abacate", emoji: "🥑", description: "11,6 cm" },
    17: { name: "Nabo", emoji: "🌰", description: "13 cm" },
    18: { name: "Pimentão", emoji: "🫑", description: "14,2 cm" },
    19: { name: "Tomate", emoji: "🍅", description: "15,3 cm" },
    20: { name: "Banana", emoji: "🍌", description: "25,6 cm" },
    21: { name: "Cenoura", emoji: "🥕", description: "26,7 cm" },
    22: { name: "Coco", emoji: "🥥", description: "27,8 cm" },
    23: { name: "Manga", emoji: "🥭", description: "28,9 cm" },
    24: { name: "Milho", emoji: "🌽", description: "30 cm" },
    25: { name: "Couve-flor", emoji: "🥦", description: "34,6 cm" },
    26: { name: "Alface", emoji: "🥬", description: "35,6 cm" },
    27: { name: "Brócolis", emoji: "🥦", description: "36,6 cm" },
    28: { name: "Berinjela", emoji: "🍆", description: "37,6 cm" },
    29: { name: "Abóbora", emoji: "🎃", description: "38,6 cm" },
    30: { name: "Pepino", emoji: "🥒", description: "39,9 cm" },
    31: { name: "Coco grande", emoji: "🥥", description: "41,1 cm" },
    32: { name: "Melão", emoji: "🍈", description: "42,4 cm" },
    33: { name: "Ananás", emoji: "🍍", description: "43,7 cm" },
    34: { name: "Abacaxi", emoji: "🍍", description: "45 cm" },
    35: { name: "Melão-de-inverno", emoji: "🍈", description: "46,2 cm" },
    36: { name: "Mamão Papaia", emoji: "🍐", description: "47,4 cm" },
    37: { name: "Acelga", emoji: "🥬", description: "48,6 cm" },
    38: { name: "Alho-poró", emoji: "🌿", description: "49,8 cm" },
    39: { name: "Melancia pequena", emoji: "🍉", description: "50,7 cm" },
    40: { name: "Melancia", emoji: "🍉", description: "51,2 cm" },
  };
  const w = Math.max(4, Math.min(40, week));
  return sizes[w] || sizes[20];
}

function getGestationalAge(dpp: string): { weeks: number; days: number; totalDays: number } {
  const dppDate = new Date(dpp);
  const today = new Date();
  const conceptionDate = new Date(dppDate.getTime() - 280 * 24 * 60 * 60 * 1000);
  const diff = Math.floor((today.getTime() - conceptionDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.max(0, Math.min(280, diff));
  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
    totalDays,
  };
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

function formatInterval(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

// ─── Onboarding ──────────────────────────────────────────────────────────────
function OnboardingScreen({ onComplete }: { onComplete: (name: string, dpp: string) => void }) {
  const [name, setName] = useState("");
  const [dpp, setDpp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="flex flex-col h-full bg-[#FDF6EF] px-7 py-10 justify-between">
      {/* Header illustration area */}
      <div className="flex flex-col items-center pt-6">
        <div className="w-28 h-28 rounded-full bg-[#F3D5CF] flex items-center justify-center mb-5 shadow-sm">
          <span className="text-5xl">🌸</span>
        </div>
        <h1 className="text-[#3D2C2C] text-3xl leading-tight text-center" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {step === 1 ? "Olá, mamãe!" : "Sua data prevista"}
        </h1>
        <p className="text-[#8C7060] text-sm mt-2 text-center leading-relaxed">
          {step === 1
            ? "Como você gostaria de ser chamada?"
            : "Informe a data provável do parto (DPP)"}
        </p>
      </div>

      {/* Input area */}
      <div className="flex-1 flex flex-col justify-center gap-5">
        {step === 1 ? (
          <div className="flex flex-col gap-2">
            <label className="text-[#8C7060] text-xs font-600 uppercase tracking-wide">Seu nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ana, Carla…"
              className="bg-white border border-[#E8DDD3] rounded-2xl px-5 py-4 text-[#3D2C2C] text-base outline-none focus:border-[#C9776C] focus:ring-2 focus:ring-[#C9776C]/20 transition-all"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-[#8C7060] text-xs font-600 uppercase tracking-wide">Data Provável do Parto</label>
            <input
              type="date"
              value={dpp}
              onChange={(e) => setDpp(e.target.value)}
              className="bg-white border border-[#E8DDD3] rounded-2xl px-5 py-4 text-[#3D2C2C] text-base outline-none focus:border-[#C9776C] focus:ring-2 focus:ring-[#C9776C]/20 transition-all"
            />
            <p className="text-[#8C7060] text-xs mt-1">
              Você encontra essa data no seu cartão de pré-natal 💌
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
            if (step === 1 && name.trim()) setStep(2);
            else if (step === 2 && dpp) onComplete(name.trim(), dpp);
          }}
          disabled={step === 1 ? !name.trim() : !dpp}
          className="w-full bg-[#C9776C] text-white rounded-2xl py-4 font-700 text-base shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === 1 ? "Continuar →" : "Começar minha jornada 🌸"}
        </button>
        {step === 2 && (
          <button onClick={() => setStep(1)} className="text-[#8C7060] text-sm text-center py-2">
            ← Voltar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Home / Dashboard ────────────────────────────────────────────────────────
function HomeScreen({ name, dpp }: { name: string; dpp: string }) {
  const age = getGestationalAge(dpp);
  const baby = getBabySize(age.weeks);
  const dppDate = new Date(dpp);
  const daysLeft = Math.max(0, Math.floor((dppDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(1, age.totalDays / 280);

  const trimester = age.weeks < 13 ? "1º Trimestre" : age.weeks < 27 ? "2º Trimestre" : "3º Trimestre";

  const tips = [
    "Beba ao menos 2 litros de água por dia 💧",
    "Movimentos do bebê são normais — aproveite cada chutinho 🦶",
    "Consultas de pré-natal são essenciais — não pule nenhuma 📋",
    "Descanse sempre que possível — seu corpo está trabalhando muito 😴",
    "Uma caminhada leve de 20 min por dia faz bem para você e o bebê 🌿",
  ];
  const todayTip = tips[new Date().getDay() % tips.length];

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#FDF6EF]">
      {/* Hero header */}
      <div className="bg-[#C9776C] px-6 pt-12 pb-8 rounded-b-[2.5rem]">
        <p className="text-[#f5d0cb] text-sm font-500">Olá, {name} 👋</p>
        <h1 className="text-white text-2xl mt-0.5 leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {trimester}
        </h1>

        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="text-white text-6xl font-800 leading-none">{age.weeks}</span>
            <span className="text-[#f5d0cb] text-lg ml-1">sem</span>
            <span className="text-white text-3xl font-700 ml-2">{age.days}</span>
            <span className="text-[#f5d0cb] ml-1">dias</span>
          </div>
          <div className="text-right">
            <p className="text-[#f5d0cb] text-xs">Faltam</p>
            <p className="text-white text-2xl font-700">{daysLeft}</p>
            <p className="text-[#f5d0cb] text-xs">dias</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 bg-[#b55e53]/40 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[#f5d0cb] text-[10px]">Semana 1</span>
          <span className="text-[#f5d0cb] text-[10px]">Semana 40</span>
        </div>
      </div>

      <div className="px-5 py-5 flex flex-col gap-4">
        {/* Baby size card */}
        <div className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-[#E8DDD3] flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F3D5CF] flex items-center justify-center text-3xl flex-shrink-0">
            {baby.emoji}
          </div>
          <div>
            <p className="text-[#8C7060] text-xs uppercase tracking-wide font-600">Seu bebê tem o tamanho de</p>
            <p className="text-[#3D2C2C] text-xl font-700 mt-0.5" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {baby.name}
            </p>
            <p className="text-[#8C7060] text-sm">{baby.description}</p>
          </div>
        </div>

        {/* Dica do dia */}
        <div className="bg-[#E8DFF5] rounded-3xl px-5 py-4 border border-[#d4c8e8]">
          <p className="text-[#5A4878] text-xs font-700 uppercase tracking-wide mb-1">Dica do dia</p>
          <p className="text-[#3D2C2C] text-sm leading-relaxed">{todayTip}</p>
        </div>

        {/* DPP info */}
        <div className="bg-white rounded-3xl px-5 py-4 shadow-sm border border-[#E8DDD3]">
          <p className="text-[#8C7060] text-xs uppercase tracking-wide font-600 mb-1">Data Provável do Parto</p>
          <p className="text-[#3D2C2C] text-base font-700">
            {new Date(dpp).toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Marcos importantes */}
        <div className="bg-white rounded-3xl px-5 py-4 shadow-sm border border-[#E8DDD3]">
          <p className="text-[#8C7060] text-xs uppercase tracking-wide font-600 mb-3">Próximos marcos</p>
          <div className="flex flex-col gap-2">
            {[
              { week: 12, label: "Ultrassom morfológico 1º tri" },
              { week: 20, label: "Ultrassom morfológico 2º tri" },
              { week: 28, label: "Início do 3º trimestre" },
              { week: 36, label: "Bebê está a termo" },
            ]
              .filter((m) => m.week > age.weeks)
              .slice(0, 3)
              .map((m) => (
                <div key={m.week} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3EBE1] flex items-center justify-center text-xs font-700 text-[#C9776C] flex-shrink-0">
                    {m.week}
                  </div>
                  <p className="text-[#3D2C2C] text-sm">{m.label}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Diary ───────────────────────────────────────────────────────────────────
function DiaryScreen() {
  const todayKey = new Date().toISOString().split("T")[0];
  const [entry, setEntry] = useState<DiaryEntry>(() => {
    const stored = localStorage.getItem(`diary-${todayKey}`);
    return stored
      ? JSON.parse(stored)
      : { date: todayKey, mood: 3, nausea: 0, weight: "", pressure: "", notes: "" };
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem(`diary-${todayKey}`, JSON.stringify(entry));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const moodLabels = ["😔", "😕", "😊", "😄", "🥰"];
  const nauseaLabels = ["Nenhum", "Leve", "Moderado", "Forte", "Intenso"];

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#FDF6EF]">
      <div className="bg-[#B8A9C9] px-6 pt-12 pb-6 rounded-b-[2.5rem]">
        <p className="text-white/70 text-sm font-500">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-white text-2xl mt-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Diário de Sintomas
        </h1>
      </div>

      <div className="px-5 py-5 flex flex-col gap-4">
        {/* Mood */}
        <div className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-[#E8DDD3]">
          <p className="text-[#8C7060] text-xs font-700 uppercase tracking-wide mb-3">Como você está hoje?</p>
          <div className="flex justify-between">
            {moodLabels.map((m, i) => (
              <button
                key={i}
                onClick={() => setEntry((e) => ({ ...e, mood: i + 1 }))}
                className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                  entry.mood === i + 1 ? "bg-[#F3D5CF] scale-110 shadow-sm" : "bg-[#F3EBE1]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Nausea */}
        <div className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-[#E8DDD3]">
          <p className="text-[#8C7060] text-xs font-700 uppercase tracking-wide mb-3">Enjoo</p>
          <div className="flex gap-2 flex-wrap">
            {nauseaLabels.map((n, i) => (
              <button
                key={i}
                onClick={() => setEntry((e) => ({ ...e, nausea: i }))}
                className={`px-4 py-2 rounded-xl text-sm font-600 transition-all ${
                  entry.nausea === i
                    ? "bg-[#C9776C] text-white shadow-sm"
                    : "bg-[#F3EBE1] text-[#8C7060]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Weight & Pressure */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-3xl px-4 py-4 shadow-sm border border-[#E8DDD3]">
            <p className="text-[#8C7060] text-xs font-700 uppercase tracking-wide mb-2">Peso (kg)</p>
            <input
              type="number"
              step="0.1"
              value={entry.weight}
              onChange={(e) => setEntry((en) => ({ ...en, weight: e.target.value }))}
              placeholder="Ex: 65.5"
              className="w-full bg-[#F3EBE1] rounded-xl px-3 py-2 text-sm text-[#3D2C2C] outline-none focus:ring-2 focus:ring-[#C9776C]/20"
            />
          </div>
          <div className="flex-1 bg-white rounded-3xl px-4 py-4 shadow-sm border border-[#E8DDD3]">
            <p className="text-[#8C7060] text-xs font-700 uppercase tracking-wide mb-2">Pressão</p>
            <input
              type="text"
              value={entry.pressure}
              onChange={(e) => setEntry((en) => ({ ...en, pressure: e.target.value }))}
              placeholder="Ex: 120/80"
              className="w-full bg-[#F3EBE1] rounded-xl px-3 py-2 text-sm text-[#3D2C2C] outline-none focus:ring-2 focus:ring-[#C9776C]/20"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-3xl px-5 py-5 shadow-sm border border-[#E8DDD3]">
          <p className="text-[#8C7060] text-xs font-700 uppercase tracking-wide mb-3">Anotações do dia</p>
          <textarea
            value={entry.notes}
            onChange={(e) => setEntry((en) => ({ ...en, notes: e.target.value }))}
            placeholder="Como você se sentiu hoje? Algum sintoma diferente?"
            rows={4}
            className="w-full bg-[#F3EBE1] rounded-2xl px-4 py-3 text-sm text-[#3D2C2C] outline-none resize-none focus:ring-2 focus:ring-[#C9776C]/20 leading-relaxed"
          />
        </div>

        <button
          onClick={save}
          className={`w-full rounded-2xl py-4 font-700 text-base transition-all shadow-md active:scale-95 ${
            saved ? "bg-[#A8C5A0] text-white" : "bg-[#C9776C] text-white"
          }`}
        >
          {saved ? "✓ Salvo!" : "Salvar registro"}
        </button>
      </div>
    </div>
  );
}

// ─── Contraction Timer ───────────────────────────────────────────────────────
function TimerScreen() {
  const [active, setActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [contractions, setContractions] = useState<ContractionEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active && startTime !== null) {
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, startTime]);

  const handlePress = () => {
    if (!active) {
      const now = Date.now();
      setStartTime(now);
      setActive(true);
    } else {
      const duration = Date.now() - (startTime ?? Date.now());
      const prev = contractions[contractions.length - 1];
      const interval = prev ? startTime! - (prev.start + prev.duration) : null;
      setContractions((c) => [
        ...c,
        { start: startTime!, duration, interval },
      ]);
      setActive(false);
      setStartTime(null);
    }
  };

  const avgInterval =
    contractions.length > 1
      ? contractions
          .slice(1)
          .reduce((s, c) => s + (c.interval ?? 0), 0) /
        (contractions.length - 1)
      : null;

  const lastDuration = contractions.length > 0 ? contractions[contractions.length - 1].duration : null;

  const needsAttention = avgInterval !== null && avgInterval < 5 * 60 * 1000 && contractions.length >= 3;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#FDF6EF]">
      <div className="bg-[#F3D5CF] px-6 pt-12 pb-6 rounded-b-[2.5rem]">
        <h1 className="text-[#3D2C2C] text-2xl" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Timer de Contrações
        </h1>
        <p className="text-[#8C7060] text-sm mt-1">Pressione ao iniciar e ao terminar cada contração</p>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 items-center">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { label: "Contrações", value: contractions.length.toString() },
            {
              label: "Última duração",
              value: lastDuration ? formatDuration(lastDuration) : "—",
            },
            {
              label: "Intervalo médio",
              value: avgInterval ? formatInterval(avgInterval) : "—",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl px-3 py-3 border border-[#E8DDD3] shadow-sm text-center">
              <p className="text-[#3D2C2C] text-lg font-800">{s.value}</p>
              <p className="text-[#8C7060] text-[10px] font-600 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Alert */}
        {needsAttention && (
          <div className="w-full bg-[#C9776C]/10 border border-[#C9776C]/30 rounded-2xl px-5 py-3">
            <p className="text-[#C9776C] text-sm font-700">⚠️ Contrações frequentes</p>
            <p className="text-[#8C7060] text-xs mt-0.5">
              Intervalo menor que 5 min. Considere contatar sua equipe médica.
            </p>
          </div>
        )}

        {/* Big button */}
        <button
          onClick={handlePress}
          className={`w-52 h-52 rounded-full shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-2 mt-2 ${
            active
              ? "bg-[#C9776C] shadow-[#C9776C]/30"
              : "bg-white border-4 border-[#C9776C]"
          }`}
        >
          {active ? (
            <>
              <span className="text-white text-4xl font-300">{formatDuration(elapsed)}</span>
              <span className="text-white/80 text-sm font-600">Toque para parar</span>
            </>
          ) : (
            <>
              <span className="text-[#C9776C] text-5xl">❤️</span>
              <span className="text-[#C9776C] font-700 text-sm">Iniciar contração</span>
            </>
          )}
        </button>

        {/* History */}
        {contractions.length > 0 && (
          <div className="w-full bg-white rounded-3xl px-5 py-4 shadow-sm border border-[#E8DDD3]">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[#8C7060] text-xs font-700 uppercase tracking-wide">Histórico</p>
              <button
                onClick={() => setContractions([])}
                className="text-[#C9776C] text-xs font-600"
              >
                Limpar
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-44 overflow-y-auto">
              {[...contractions].reverse().map((c, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[#F3EBE1] last:border-0">
                  <span className="text-[#3D2C2C] text-sm font-600">
                    #{contractions.length - i}
                  </span>
                  <span className="text-[#3D2C2C] text-sm">
                    {formatDuration(c.duration)}
                  </span>
                  <span className="text-[#8C7060] text-sm">
                    {c.interval ? `↔ ${formatInterval(c.interval)}` : "—"}
                  </span>
                  <span className="text-[#8C7060] text-xs">
                    {new Date(c.start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────
function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const items: { id: Screen; emoji: string; label: string }[] = [
    { id: "home", emoji: "🏠", label: "Início" },
    { id: "diary", emoji: "📔", label: "Diário" },
    { id: "timer", emoji: "⏱️", label: "Contrações" },
  ];

  return (
    <div className="flex-shrink-0 bg-white border-t border-[#E8DDD3] flex">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setScreen(item.id)}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all ${
            screen === item.id ? "text-[#C9776C]" : "text-[#8C7060]"
          }`}
        >
          <span className={`text-xl transition-transform ${screen === item.id ? "scale-110" : ""}`}>
            {item.emoji}
          </span>
          <span className={`text-[10px] font-700 ${screen === item.id ? "text-[#C9776C]" : "text-[#8C7060]"}`}>
            {item.label}
          </span>
          {screen === item.id && (
            <div className="w-1 h-1 rounded-full bg-[#C9776C] mt-0.5" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────
export default function App() {
  const [userData, setUserData] = useState<{ name: string; dpp: string } | null>(() => {
    const stored = localStorage.getItem("mamae-user");
    return stored ? JSON.parse(stored) : null;
  });
  const [screen, setScreen] = useState<Screen>("home");

  const handleOnboardingComplete = (name: string, dpp: string) => {
    const data = { name, dpp };
    localStorage.setItem("mamae-user", JSON.stringify(data));
    setUserData(data);
    setScreen("home");
  };

  if (!userData) {
    return (
      <div className="size-full flex items-center justify-center bg-[#FDF6EF]">
        <div className="w-full max-w-sm h-full flex flex-col">
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex items-center justify-center bg-[#E8DDD3]">
      <div className="w-full max-w-sm h-full flex flex-col bg-[#FDF6EF] overflow-hidden shadow-2xl relative">
        <div className="flex-1 overflow-hidden">
          {screen === "home" && <HomeScreen name={userData.name} dpp={userData.dpp} />}
          {screen === "diary" && <DiaryScreen />}
          {screen === "timer" && <TimerScreen />}
        </div>
        <BottomNav screen={screen} setScreen={setScreen} />
      </div>
    </div>
  );
}
