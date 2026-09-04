'use client';
import { useState, useTransition } from "react";

export default function TagManager({ tags, afegirTag, eliminarTag }) {
  const [tagToDelete, setTagToDelete] = useState(null);
  const [isPending, startTransition] = useTransition();

  const confirmDelete = () => {
    if (!tagToDelete) return;
    const formData = new FormData();
    formData.append("id", tagToDelete._id);
    startTransition(() => {
      eliminarTag(formData);
    });
    setTagToDelete(null);
  };

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg h-fit">
        <h4 className="font-bold text-sm text-slate-200 mb-4">
          Afegir categories
        </h4>
        <form action={afegirTag} className="flex gap-2 mb-6">
          <input
            type="text"
            name="name"
            placeholder="Nova categoria (ex: Acció...)"
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 flex-1 shadow-inner"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            Afegir
          </button>
        </form>

        <div>
          <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Categories existents:
          </h5>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag._id}
                  className="bg-slate-900 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm flex items-center gap-2"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => setTagToDelete(tag)}
                    className="text-slate-500 hover:text-rose-400 transition cursor-pointer leading-none"
                    title="Eliminar categoria"
                  >
                    ✕
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">
                No hi ha categories creades.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal alerta eliminar */}
      {tagToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-slate-200 font-semibold text-base mb-2">
              Eliminar categoria
            </h3>
            <p className="text-slate-400 text-sm mb-5">Segur que vols eliminar la categoria <span className="text-slate-200 font-medium">{tagToDelete.name}</span>? Aquesta acció no es pot desfer i les pel·lícules que la tenien assignada es quedaran sense categoria.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTagToDelete(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 border border-slate-600 hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel·lar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
