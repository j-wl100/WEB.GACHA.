import React, { useState } from 'react';
import { Send, UserCheck, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, registerUser, loginUser, currentUser } = useGame();
  const [isRegisterMode, setIsRegisterMode] = useState(true);

  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [telegram, setTelegram] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen && currentUser) {
    return null;
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 10 || numAge > 120) {
      setError('Por favor ingresa una edad válida (10 - 120)');
      return;
    }

    if (!telegram.trim()) {
      setError('Por favor ingresa tu usuario de Telegram (@usuario)');
      return;
    }

    const result = registerUser(name, numAge, telegram);
    if (!result.success) {
      setError(result.error || 'Hubo un error al crear la cuenta. Inténtalo de nuevo.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginIdentifier.trim()) {
      setError('Ingresa tu @usuario de Telegram o tu Nombre de agente registrado');
      return;
    }

    const result = loginUser(loginIdentifier);
    if (!result.success) {
      setError(result.error || 'No encontramos una cuenta registrada con esos datos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white text-[#0F172A] rounded-3xl p-6 shadow-2xl border border-slate-200 transform transition-all overflow-hidden relative">
        {/* Decorative Top Accent in Dark Navy */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0F172A]" />

        {/* Brand Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0F172A] text-white mb-3 shadow-md">
            <span className="font-extrabold text-xl tracking-wider">SP</span>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
            {isRegisterMode ? 'Bienvenido a SPYCT' : 'Iniciar Sesión'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegisterMode 
              ? 'Únete al RPG de espionaje, colecciona personajes y sincroniza con Telegram' 
              : 'Ingresa tus credenciales para acceder a tu inventario'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-5 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              isRegisterMode
                ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                : 'text-slate-500 hover:text-[#0F172A]'
            }`}
          >
            Crear Cuenta
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              !isRegisterMode
                ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                : 'text-slate-500 hover:text-[#0F172A]'
            }`}
          >
            Iniciar Sesión
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 mb-4 text-xs text-rose-900 bg-rose-50 border border-rose-200 rounded-2xl animate-in fade-in duration-150">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <span className="font-semibold block">{error}</span>
                {!isRegisterMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError(null);
                    }}
                    className="mt-1.5 text-[11px] font-bold text-[#1E3A8A] underline hover:text-[#0F172A] block"
                  >
                    ¿Es tu primera vez? Crear cuenta nueva aquí
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Register Form */}
        {isRegisterMode ? (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                1. Nombre
              </label>
              <input
                type="text"
                placeholder="Tu nombre o apodo de agente"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:border-[#0F172A] focus:outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                2. Edad
              </label>
              <input
                type="number"
                placeholder="Ej. 22"
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full h-11 px-3.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:border-[#0F172A] focus:outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                3. Usuario de Telegram
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="@usuario"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="w-full h-11 pl-9 pr-3.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:border-[#0F172A] focus:outline-none transition-all placeholder:text-slate-400"
                  required
                />
                <Send className="w-4 h-4 text-[#1E3A8A] absolute left-3 top-3.5" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Necesario para vincular tarjetas y recibir recompensas
              </p>
            </div>

            {/* Starter Gift Box Notice */}
            <div className="flex items-center gap-2 p-2.5 bg-slate-100 border border-slate-200 rounded-2xl">
              <Sparkles className="w-4 h-4 text-[#1E3A8A] shrink-0" />
              <p className="text-[11px] text-slate-700 font-medium">
                ¡Bono de bienvenida: <strong className="font-bold text-[#0F172A]">160 Coins + 15 Gemas</strong> gratis!
              </p>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-[#0F172A] hover:bg-[#1E3A8A] active:scale-98 text-white text-sm font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
            >
              <UserCheck className="w-4 h-4" />
              <span>Registrarse y Entrar</span>
            </button>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Usuario de Telegram o Nombre
              </label>
              <input
                type="text"
                placeholder="@usuario o Tu Nombre"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full h-11 px-3.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:border-[#0F172A] focus:outline-none transition-all placeholder:text-slate-400"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1.5">
                Ingresa el @usuario de Telegram o el nombre registrado al crear tu cuenta.
              </p>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-[#0F172A] hover:bg-[#1E3A8A] active:scale-98 text-white text-sm font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 mt-6"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Entrar a mi Cuenta</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
