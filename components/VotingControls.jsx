'use client';

import { useState, useEffect } from 'react';

export default function VotingControls({
  activeMoviesCount,
  numPelisVotacio,
  votingClosed,
  mesos,
  anys,
  tancarRonda,
  reobrirRonda,
  resetejarVotacio
}) {
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => {
        setStatusMsg({ text: '', type: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const handleAction = async (actionFn, formData = null) => {
    setLoading(true);
    try {
      const res = await actionFn(formData);
      if (res?.message) {
        setStatusMsg({
          text: res.message,
          type: res.success ? 'success' : 'error'
        });
      }
    } catch (err) {
      setStatusMsg({ text: 'S’ha produït un error inesperat.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 ">
      <h2 className="text-2xl font-bold border-b border-slate-800 pb-3">
        🗳️ <span>Votació</span>
      </h2> 

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Tancament i reseteig</h2>
            <p className="text-xs text-slate-400 mt-1">Pas 1: Tanca la votació i assigna pel·lícula guanyadora (amb opció de reobrir).</p>
            <p className="text-xs text-slate-400 mt-1">Pas 2: Reseteja els vots, buida pel·lícules de la votació i neteja cookies per al mes següent.</p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${activeMoviesCount === numPelisVotacio ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
            {activeMoviesCount} / {numPelisVotacio} en votació
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pas 1: Tancar / Reobrir */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pas 1: Tancar / Reobrir votació</h4>
              <p className="text-[11px] text-slate-400 mt-1">Tanca la votació i assigna la pel·lícula guanyadora del mes.</p>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <button 
                type="button"
                disabled={activeMoviesCount !== numPelisVotacio || votingClosed || loading}
                onClick={() => handleAction(tancarRonda)}
                className={`w-full px-4 py-2 rounded-lg text-xs font-semibold transition shadow-md ${activeMoviesCount === numPelisVotacio && !votingClosed && !loading ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer' : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'}`}
              >
                Tancar votació del mes 🏆
              </button>

              <button 
                type="button"
                disabled={!votingClosed || loading}
                onClick={() => handleAction(reobrirRonda)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  votingClosed && !loading
                    ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer' 
                    : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'
                }`}
                title="Tirar enrere / Reobrir"
              >
                Reobrir 🔄
              </button>
            </div>
          </div>

          {/* Pas 2: Resetejar */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pas 2: Resetejar votació</h4>
              <p className="text-[11px] text-slate-400 mt-1">Treure les pel·lícules de la votació, posar els vots a 0, guardar el mes i començar el mes següent.</p>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAction(resetejarVotacio, new FormData(e.target));
              }} 
              className="flex flex-col gap-2 pt-2 border-t border-slate-800"
            >
              <div className="flex gap-2">
                <select name="mes" defaultValue={mesos[new Date().getMonth()]} className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer flex-1">
                  {mesos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="any" defaultValue={new Date().getFullYear()} className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer">
                  {anys.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <button 
                type="submit" 
                disabled={activeMoviesCount !== numPelisVotacio || loading}
                className={`w-full text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-md ${activeMoviesCount === numPelisVotacio && !loading ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer' : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'}`}
              >
                Guardar històric del mes i resetejar 🧹
              </button>
            </form>
          </div>
        </div>

        {statusMsg.text && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-medium border transition-all ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {statusMsg.text}
          </div>
        )}

        {activeMoviesCount !== numPelisVotacio && (
          <p className="text-[11px] text-amber-400 mt-2">Cal tenir exactament {numPelisVotacio} pel·lícules en votació per poder tancar la votació.</p>
        )}
      </div>
    </div>
  );
}