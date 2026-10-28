import React, { useState } from 'react';
import { 
  Send, 
  Coins, 
  Gem, 
  LogOut, 
  Lock, 
  X, 
  KeyRound
} from 'lucide-react';
import { useGame } from '../context/GameContext';

export const ProfileDropdown: React.FC = () => {
  const { 
    currentUser, 
    isProfileOpen, 
    setIsProfileOpen, 
    setIsAdminModalOpen, 
    logout 
  } = useGame();

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  if (!isProfileOpen || !currentUser) return null;

  const handleOpenAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.trim() === 'J#SPYCT') {
      setPasswordError(false);
      setShowPasswordPrompt(false);
      setAdminPassword('');
      setIsProfileOpen(false);
      setIsAdminModalOpen(true);
    } else {
      setPasswordError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xs mt-14 bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 text-[#0F172A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => {
            setIsProfileOpen(false);
            setShowPasswordPrompt(false);
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-black hover:bg-slate-100"
          aria-label="Cerrar menú de perfil"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Avatar & Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-lg shadow-xs uppercase">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[#0F172A] truncate">
              {currentUser.name}
            </h3>
            <p className="text-xs text-[#1E3A8A] font-medium truncate flex items-center gap-1">
              <Send className="w-3 h-3 shrink-0" />
              <span>{currentUser.telegram}</span>
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              {currentUser.age} años
            </span>
          </div>
        </div>

        {/* Wallet Balances Card */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 mb-4 font-mono">
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-slate-100 text-[#0F172A] flex items-center justify-center">
              <Coins className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block leading-none">Coins</span>
              <span className="text-xs font-bold text-[#0F172A]">{currentUser.coins}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-slate-100 text-[#1E3A8A] flex items-center justify-center">
              <Gem className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block leading-none">Gemas</span>
              <span className="text-xs font-bold text-[#1E3A8A]">{currentUser.gems}</span>
            </div>
          </div>
        </div>

        {/* Admin Password Gate Form (Does NOT reveal password anywhere) */}
        {showPasswordPrompt ? (
          <form onSubmit={handleOpenAdmin} className="space-y-2 mb-3 p-3 bg-slate-50 text-[#0F172A] rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#1E3A8A]" /> Clave de Administrador
              </span>
              <button
                type="button"
                onClick={() => setShowPasswordPrompt(false)}
                className="text-[10px] text-slate-500 hover:text-black"
              >
                Cancelar
              </button>
            </div>
            <input
              type="password"
              placeholder="Ingresa la contraseña..."
              value={adminPassword}
              onChange={(e) => {
                setAdminPassword(e.target.value);
                setPasswordError(false);
              }}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F172A]"
              autoFocus
            />
            {passwordError && (
              <span className="text-[10px] text-rose-600 block">
                Contraseña incorrecta. Acceso denegado.
              </span>
            )}
            <button
              type="submit"
              className="w-full py-2 bg-[#0F172A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Acceder al Panel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowPasswordPrompt(true)}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-between mb-2 active:scale-98"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#1E3A8A]" />
              <span>Panel de Administración</span>
            </div>
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full py-2.5 px-3 text-rose-700 hover:bg-rose-50 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
