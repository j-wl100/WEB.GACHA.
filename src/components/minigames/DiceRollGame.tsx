import React, { useState } from 'react';
import { Dices, Coins, ArrowLeft, RotateCw } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface Props {
  onBack: () => void;
}

export const DiceRollGame: React.FC<Props> = ({ onBack }) => {
  const { addCoins } = useGame();
  const [isRolling, setIsRolling] = useState(false);
  const [dice1, setDice1] = useState(3);
  const [dice2, setDice2] = useState(4);
  const [prediction, setPrediction] = useState<'high' | 'low' | 'seven'>('high');
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [coinsWon, setCoinsWon] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setResultMessage(null);
    setCoinsWon(null);

    let rolls = 0;
    const interval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      rolls++;

      if (rolls >= 10) {
        clearInterval(interval);
        const final1 = Math.floor(Math.random() * 6) + 1;
        const final2 = Math.floor(Math.random() * 6) + 1;
        setDice1(final1);
        setDice2(final2);
        setIsRolling(false);

        const sum = final1 + final2;
        let won = false;
        let payout = 0;

        if (prediction === 'high' && sum > 7) {
          won = true;
          payout = 20;
        } else if (prediction === 'low' && sum < 7) {
          won = true;
          payout = 20;
        } else if (prediction === 'seven' && sum === 7) {
          won = true;
          payout = 50;
        }

        if (won) {
          const streakBonus = streak * 5;
          const totalReward = payout + streakBonus;
          setCoinsWon(totalReward);
          setStreak(prev => prev + 1);
          setResultMessage(`¡Acertaste! La suma fue ${sum}. (+${totalReward} coins)`);
          addCoins(totalReward, 'Dice Roll Win');
        } else {
          setStreak(0);
          setCoinsWon(0);
          setResultMessage(`Fallaste. La suma fue ${sum}. ¡Vuelve a intentarlo!`);
        }
      }
    }, 80);
  };

  const sum = dice1 + dice2;

  return (
    <div className="bg-white text-[#0F172A] rounded-3xl p-5 border border-slate-200 shadow-sm">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="p-2 text-slate-700 hover:text-black rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver
        </button>
        <div className="flex items-center gap-1 text-xs font-mono font-bold bg-slate-100 text-[#1E3A8A] border border-slate-200 px-3 py-1 rounded-xl">
          <span>Racha: {streak}</span>
        </div>
      </div>

      <div className="text-center mb-5">
        <h2 className="text-lg font-extrabold text-[#0F172A]">Dice Roll</h2>
        <p className="text-xs text-slate-500">
          Pronostica si la suma de los dados será Alta (&gt;7), Baja (&lt;7) o 7 Exacto.
        </p>
      </div>

      {/* Visual Dice Display */}
      <div className="py-6 px-4 bg-slate-50 rounded-3xl flex flex-col items-center justify-center text-[#0F172A] mb-5 border border-slate-200">
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Die 1 */}
          <div className={`w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl font-black text-[#0F172A] border-2 border-slate-300 ${isRolling ? 'animate-bounce' : ''}`}>
            {dice1}
          </div>
          {/* Plus sign */}
          <span className="text-2xl font-bold text-[#1E3A8A]">+</span>
          {/* Die 2 */}
          <div className={`w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl font-black text-[#0F172A] border-2 border-slate-300 ${isRolling ? 'animate-bounce delay-75' : ''}`}>
            {dice2}
          </div>
        </div>

        <div className="text-center">
          <span className="text-xs text-slate-500 block font-mono">Suma Total</span>
          <span className="text-2xl font-black text-[#0F172A] font-mono">
            {isRolling ? '...' : sum}
          </span>
        </div>
      </div>

      {/* Prediction Selector Buttons */}
      <div className="space-y-2 mb-4">
        <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">
          Tu Pronóstico
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            disabled={isRolling}
            onClick={() => setPrediction('low')}
            className={`py-2.5 px-1 rounded-2xl text-xs font-bold transition-all border ${
              prediction === 'low'
                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            Baja (2-6)
            <span className="block text-[10px] text-slate-400 font-mono">Paga 20c</span>
          </button>

          <button
            disabled={isRolling}
            onClick={() => setPrediction('seven')}
            className={`py-2.5 px-1 rounded-2xl text-xs font-bold transition-all border ${
              prediction === 'seven'
                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            7 Exacto
            <span className="block text-[10px] text-slate-300 font-mono">Paga 50c</span>
          </button>

          <button
            disabled={isRolling}
            onClick={() => setPrediction('high')}
            className={`py-2.5 px-1 rounded-2xl text-xs font-bold transition-all border ${
              prediction === 'high'
                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            Alta (8-12)
            <span className="block text-[10px] text-slate-400 font-mono">Paga 20c</span>
          </button>
        </div>
      </div>

      {/* Feedback Message */}
      {resultMessage && (
        <div
          className={`p-3 rounded-2xl text-center text-xs font-bold mb-4 ${
            coinsWon && coinsWon > 0
              ? 'bg-slate-100 text-[#1E3A8A] border border-slate-300'
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          {resultMessage}
        </div>
      )}

      {/* Roll Action Button */}
      <button
        disabled={isRolling}
        onClick={rollDice}
        className="w-full py-3.5 bg-[#0F172A] hover:bg-[#1E3A8A] disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all shadow-sm"
      >
        <RotateCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
        <span>{isRolling ? 'Lanzando Dados...' : 'Lanzar Dados'}</span>
      </button>
    </div>
  );
};
