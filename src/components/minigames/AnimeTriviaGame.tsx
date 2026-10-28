import React, { useState, useEffect } from 'react';
import { HelpCircle, Coins, ArrowLeft, CheckCircle2, XCircle, RotateCcw, Award, Layers } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface Props {
  onBack: () => void;
}

export type TriviaCategory = 'Cultura Pop / Anime' | 'Videojuegos' | 'Trivia General';

interface Question {
  question: string;
  category: TriviaCategory;
  options: string[];
  correct: number;
  explanation: string;
}

const CATEGORIES: TriviaCategory[] = [
  'Cultura Pop / Anime',
  'Videojuegos',
  'Trivia General'
];

const QUESTIONS_DATABASE: Record<TriviaCategory, Question[]> = {
  'Cultura Pop / Anime': [
    {
      question: 'En Jujutsu Kaisen, ¿cuál es la técnica de expansión de dominio de Satoru Gojo?',
      category: 'Cultura Pop / Anime',
      options: ['Fukuma Mizushi', 'Muryōkūsho (Vacío Inconmensurable)', 'Chimera Shadow Garden', 'Horizonte Cautivador'],
      correct: 1,
      explanation: 'El Vacío Inconmensurable inunda la mente del adversario con información infinita dejándolo inmóvil.'
    },
    {
      question: 'En One Piece, ¿cuál es el nombre de la espada legendaria que Zoro recibió del samurái Ryuma en Thriller Bark?',
      category: 'Cultura Pop / Anime',
      options: ['Wado Ichimonji', 'Shusui', 'Sandai Kitetsu', 'Enma'],
      correct: 1,
      explanation: 'Ryuma le entrega la espada negra Shusui tras reconocer su valentía como espadachín.'
    },
    {
      question: 'En Attack on Titan, ¿cuántos titanes cambiantes existen originalmente del linaje de Ymir?',
      category: 'Cultura Pop / Anime',
      options: ['7 Titanes', '9 Titanes', '12 Titanes', '5 Titanes'],
      correct: 1,
      explanation: 'Los 9 Titanes cambiantes descienden del poder original de la fundadora Ymir Fritz.'
    },
    {
      question: 'En Demon Slayer, ¿cuál es la técnica respiratoria primordial y madre de todas las demás?',
      category: 'Cultura Pop / Anime',
      options: ['Respiración del Agua', 'Respiración Solar (Danza del Dios del Fuego)', 'Respiración del Rayo', 'Respiración Lunar'],
      correct: 1,
      explanation: 'La Respiración Solar ideada por Yoriichi Tsugikuni dio origen a todas las variantes posteriores.'
    },
    {
      question: 'En la serie Spy x Family, ¿cuál es la habilidad secreta de la pequeña Anya Forger?',
      category: 'Cultura Pop / Anime',
      options: ['Predecir el futuro', 'Telepatía (leer mentes)', 'Invisibilidad', 'Súper fuerza'],
      correct: 1,
      explanation: 'Anya es el Sujeto 007 y tiene la habilidad psíquica de escuchar los pensamientos de las personas.'
    }
  ],
  'Videojuegos': [
    {
      question: 'En The Legend of Zelda, ¿cómo se llama la espada legendaria consagrada para repeler el mal?',
      category: 'Videojuegos',
      options: ['Espada Biggoron', 'Espada Maestra', 'Espada Kokiri', 'Espada de las Sombras'],
      correct: 1,
      explanation: 'La Espada Maestra (Master Sword) aguarda en el Pedestal del Tiempo y canaliza poder sagrado.'
    },
    {
      question: '¿Qué famoso enemigo de Minecraft fue creado accidentalmente al equivocarse con las proporciones de un cerdo?',
      category: 'Videojuegos',
      options: ['Enderman', 'Creeper', 'Zombie Pigman', 'Esqueleto'],
      correct: 1,
      explanation: 'Notch invirtió por error la longitud y altura del cerdo en 2009, naciendo el diseño del Creeper.'
    },
    {
      question: 'En la franquicia Pokémon, ¿cuáles son los tres tipos elementales clásicos de los iniciales?',
      category: 'Videojuegos',
      options: ['Fuego, Agua y Planta', 'Eléctrico, Hielo y Roca', 'Dragón, Siniestro y Hada', 'Normal, Lucha y Volador'],
      correct: 0,
      explanation: 'El triángulo elemental de Fuego, Agua y Planta define el balance inicial de cada región.'
    },
    {
      question: '¿Quién es el aclamado creador y director de FromSoftware responsable de Demon Souls, Dark Souls y Elden Ring?',
      category: 'Videojuegos',
      options: ['Hideo Kojima', 'Hidetaka Miyazaki', 'Shinji Mikami', 'Tetsuya Nomura'],
      correct: 1,
      explanation: 'Hidetaka Miyazaki diseñó la mitología y dificultad insignia de la serie Soulsborne.'
    },
    {
      question: '¿Cuál es el nombre clave del protagonista Spartan-II con armadura de combate en la saga Halo?',
      category: 'Videojuegos',
      options: ['Marcus Fenix', 'Master Chief (John-117)', 'Gordon Freeman', 'Samus Aran'],
      correct: 1,
      explanation: 'John-117 es el legendario suboficial y Jefe Maestro defensor de la humanidad.'
    }
  ],
  'Trivia General': [
    {
      question: '¿Cuál es el planeta con mayor volumen y masa de nuestro Sistema Solar?',
      category: 'Trivia General',
      options: ['Saturno', 'Júpiter', 'Neptuno', 'Urano'],
      correct: 1,
      explanation: 'Júpiter es un gigante gaseoso que contiene más del doble de materia que el resto de planetas juntos.'
    },
    {
      question: '¿Cuál es el símbolo químico correspondiente al elemento Oro en la tabla periódica?',
      category: 'Trivia General',
      options: ['Ag', 'Au', 'Fe', 'Pt'],
      correct: 1,
      explanation: 'El símbolo Au deriva del vocablo en latín "aurum", que significa resplandor reluciente.'
    },
    {
      question: '¿En qué año alunizó la misión Apolo 11 permitiendo los primeros pasos de un ser humano en la Luna?',
      category: 'Trivia General',
      options: ['1965', '1969', '1972', '1975'],
      correct: 1,
      explanation: 'El 20 de julio de 1969 Neil Armstrong y Edwin Aldrin llegaron a la superficie lunar.'
    },
    {
      question: '¿Cuál es el órgano más extenso del cuerpo humano?',
      category: 'Trivia General',
      options: ['El Hígado', 'La Piel', 'El Cerebro', 'Los Pulmones'],
      correct: 1,
      explanation: 'La piel conforma el sistema tegumentario y es el órgano de mayor superficie y peso corporal.'
    },
    {
      question: '¿Cuál es el río más caudaloso y con mayor cuenca hidrográfica del planeta Tierra?',
      category: 'Trivia General',
      options: ['Río Nilo', 'Río Amazonas', 'Río Yangtsé', 'Río Misisipi'],
      correct: 1,
      explanation: 'El río Amazonas transporta aproximadamente una quinta parte de toda el agua fluvial del mundo.'
    }
  ]
};

export const AnimeTriviaGame: React.FC<Props> = ({ onBack }) => {
  const { addCoins } = useGame();
  
  // Selected category state
  const [selectedCategory, setSelectedCategory] = useState<TriviaCategory>('Cultura Pop / Anime');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hasAnswered, setHasAnswered] = useState(false);

  const activeQuestions = QUESTIONS_DATABASE[selectedCategory];
  const currentQ = activeQuestions[currentIdx];

  // Timer countdown
  useEffect(() => {
    if (isGameOver || hasAnswered) return;

    if (timeLeft <= 0) {
      handleSelectOption(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGameOver, hasAnswered]);

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedOption(idx);

    if (idx === currentQ.correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setTimeLeft(15);
    } else {
      setIsGameOver(true);
      const totalScore = score + (selectedOption === currentQ.correct ? 1 : 0);
      let earnedCoins = totalScore * 15;
      if (totalScore === activeQuestions.length) {
        earnedCoins += 25; // Perfect round bonus
      }
      if (earnedCoins > 0) {
        addCoins(earnedCoins, `Trivia - ${selectedCategory}`);
      }
    }
  };

  const resetGame = (newCategory?: TriviaCategory) => {
    if (newCategory) {
      setSelectedCategory(newCategory);
    }
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setIsGameOver(false);
    setTimeLeft(15);
    setHasAnswered(false);
  };

  return (
    <div className="bg-white text-[#0F172A] rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <button
          onClick={onBack}
          className="px-2.5 py-1.5 text-slate-700 hover:text-black rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 text-xs font-bold active:scale-95 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver
        </button>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#0F172A] bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
          <HelpCircle className="w-3.5 h-3.5 text-[#1E3A8A]" />
          <span>Preguntas Generales</span>
        </div>
      </div>

      {/* Category Selection Tabs (Strictly 3 Key Categories) */}
      <div className="mb-4">
        <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          <Layers className="w-3 h-3 text-[#1E3A8A]" />
          <span>Categoría Activa (3 opciones):</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => resetGame(cat)}
                className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold transition-all truncate ${
                  isSelected
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-200/60'
                }`}
                title={cat}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {!isGameOver ? (
        <div>
          {/* Progress & Timer bar */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-[#0F172A] transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / activeQuestions.length) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {currentIdx + 1}/{activeQuestions.length}
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                  timeLeft <= 4
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Current Category Tag */}
          <div className="mb-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#1E3A8A] border border-slate-200">
              {currentQ.category}
            </span>
          </div>

          {/* Question Title */}
          <h3 className="text-sm font-bold text-[#0F172A] leading-snug mb-3.5 min-h-[44px]">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-2 mb-3.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correct;

              let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';
              if (hasAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-800 text-white border-rose-800 font-bold';
                } else {
                  btnStyle = 'bg-slate-100 text-slate-400 border-transparent opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3 rounded-2xl text-xs font-semibold text-left border transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {hasAnswered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-2" />
                  )}
                  {hasAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation banner if answered */}
          {hasAnswered && (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl mb-3.5 text-xs text-slate-800 leading-relaxed">
              <strong className="block font-bold text-[#1E3A8A] mb-0.5">Explicación:</strong>
              {currentQ.explanation}
            </div>
          )}

          {/* Next Button */}
          {hasAnswered && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-3 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl font-bold text-xs active:scale-98 transition-all shadow-xs"
            >
              {currentIdx < activeQuestions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados Finales'}
            </button>
          )}
        </div>
      ) : (
        /* Results Screen */
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 text-[#0F172A] mx-auto flex items-center justify-center mb-3 shadow-xs">
            <Award className="w-8 h-8 text-[#1E3A8A]" />
          </div>

          <h3 className="text-xl font-black text-[#0F172A] mb-1">
            Ronda de Trivia Completada
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Categoría: <span className="font-bold text-[#0F172A]">{selectedCategory}</span> &bull; Acertaste {score} de {activeQuestions.length} preguntas.
          </p>

          {/* Reward Display */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl mb-5 inline-block w-full">
            <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider mb-1">
              Recompensa Obtenida
            </span>
            <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-[#0F172A] font-mono">
              <Coins className="w-6 h-6 text-[#1E3A8A]" />
              <span>+{score * 15 + (score === activeQuestions.length ? 25 : 0)} Coins</span>
            </div>
            {score === activeQuestions.length && (
              <span className="text-[10px] text-[#1E3A8A] font-extrabold mt-1 block">
                ¡Puntaje Perfecto! Bono adicional de +25 Coins otorgado.
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => resetGame()}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Jugar Otra Vez</span>
            </button>
            <button
              onClick={onBack}
              className="py-3 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl font-bold text-xs shadow-xs active:scale-95 transition-all"
            >
              Volver a Juegos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
