import Navbar from '@/components/Navbar'; // Ajusta la ruta del Navbar si cal

export default function RecursosPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar page={"recurs"} />

      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        {/* Capçalera */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Recursos del Club de Cinema
          </h1>
          <p className="text-slate-400 text-lg">
            Una guia completa de recursos, enllaços d'interès, plataformes,
            catàlegs i col·leccions per als amants del setè art.
          </p>
        </div>

        {/* 1. PEL·LÍCULES */}
        <section
          id="pelicules"
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6"
        >
          <h2 className="text-2xl font-bold text-indigo-400 border-b border-slate-800 pb-3">
            🎬 Pel·lícules
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200">Torrents</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a
                    href="https://thepiratebay.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    The Pirate Bay ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://limetorrents.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    LimeTorrents ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://yts.mx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    YTS ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.torrentdownload.info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Torrent Downloads ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://torrentgalaxy.to"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    TorrentGalaxy ↗
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200">
                Kodi & Aplicacions
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a
                    href="https://mundokodi.com/addon-elementum-en-kodi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Elementum ↗{" "}
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      Kodi
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://mundokodi.com/addon-elementum-en-kodi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Balandro ↗{" "}
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      Kodi
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://mundokodi.com/addon-elementum-en-kodi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Netfly ↗{" "}
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      App
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://mundokodi.com/addon-elementum-en-kodi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Popcorn Time ↗{" "}
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      App
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/60">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200">
                Pel·lícules en català
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a
                    href="https://www.rucatala.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Rucatala ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://web.totsrucs.cat/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    TotsRucs ↗
                  </a>
                </li>
                <li>
                  <a
                    href="http://t.me/+barJQpngeyBkMGY0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Cine En Català ↗
                  </a>
                </li>
                <li>
                  <a
                    href="http://t.me/+du4QE1Qm_Y04OTA0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Cinema clàssic en català ↗
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200">
                Pel·lícules en castellà
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a
                    href="https://dontorrent.prof/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    DonTorrent ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://www39.mejortorrent.eu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    MejorTorrent ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/60">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200">
                Plataformes gratuïtes
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a
                    href="https://www.ccma.cat/tv3/alacarta/3cat/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Plex ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ccma.cat/tv3/alacarta/3cat/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    3Cat ↗{" "}
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      cat
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.rtve.es/play/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    RTVE Play ↗{" "}
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      cas
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. SUBTÍTOLS */}
        <section
          id="subtitols"
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-2xl font-bold text-indigo-400 border-b border-slate-800 pb-3">
            💬 Subtítols
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">
                Multiidiomes
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.opensubtitles.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    opensubtitles.org ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.opensubtitles.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    opensubtitles.com ↗
                  </a>
                </li>
              </ul>
            </div>
            <ul className="space-y-2">
              <h3 className="font-semibold text-slate-200 mb-2">Traducció</h3>
              <li>
                <a
                  href="https://translatesubtitles.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition"
                >
                  Translate Subtitles - Subtitles Translator ↗
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* 3. INFORMACIÓ */}
        <section
          id="informacio"
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-2xl font-bold text-indigo-400 border-b border-slate-800 pb-3">
            📚 Informació i guies
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Plataformes</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.imdb.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    IMDb ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.filmaffinity.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Filmaffinity ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.rottentomatoes.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Rotten Tomatoes ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://letterboxd.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Letterboxd ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    TMDB ↗{" "}
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      cat
                    </span>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">
                Guies i arxius
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://watch.popcorntime.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Popcorn Time ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.filmoteca.cat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Filmoteca de Catalunya ↗{" "}
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      cat
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://esadir.cat/filmoteca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-400 transition"
                  >
                    Filmoteca: títols de pel·lícules - ésAdir ↗{" "}
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                      cat
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. COL·LECCIONS */}
        <section
          id="llistes"
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-2xl font-bold text-indigo-400 border-b border-slate-800 pb-3">
            🗂️ Col·leccions i llistes
          </h2>

          <div>
            <a
              href="https://www.imdb.com/user/ur73031292/lists/?ref_=hm_nv_lst"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-300 font-bold text-slate-400 uppercase tracking-wider hover:text-slate-400/60 transition group"
            >
              <span>Llistes IMDb La Paraula Justa ↗</span>
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-200">
                  <th className="py-3 px-4 font-semibold">Llista</th>
                  <th className="py-3 px-4 font-semibold">Descripció</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {/* Llista 2 */}
                <tr className="hover:bg-slate-800/60 transition group">
                  <td className="py-3 px-4 font-medium">
                    <a
                      href="https://www.imdb.com/list/ls590635020/?ref_=uspf_t_2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 group-hover:underline flex items-center gap-1"
                    >
                      Construcció d'un relat ↗
                    </a>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    Cròniques inquietants que mantenen la tensió fins al final
                    (thriller, drama).
                  </td>
                </tr>

                {/* Llista 3 */}
                <tr className="hover:bg-slate-800/60 transition group">
                  <td className="py-3 px-4 font-medium">
                    <a
                      href="https://www.imdb.com/list/ls590630447/?ref_=uspf_t_3"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 group-hover:underline flex items-center gap-1"
                    >
                      Macarrisme universal ↗
                    </a>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    Cinema amb drogues, delinqüència i crítica social (quinqui,
                    neoquinqui).
                  </td>
                </tr>

                {/* Llista 4 */}
                <tr className="hover:bg-slate-800/60 transition group">
                  <td className="py-3 px-4 font-medium">
                    <a
                      href="https://www.imdb.com/list/ls590630220/?ref_=uspf_t_4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 group-hover:underline flex items-center gap-1"
                    >
                      Realitat quotidiana ↗
                    </a>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    Pel·lícules on no cal que "passi res" per ensenyar-t'ho tot
                    (drama, costumisme, realisme).
                  </td>
                </tr>

                {/* Llista 5 */}
                <tr className="hover:bg-slate-800/60 transition group">
                  <td className="py-3 px-4 font-medium">
                    <a
                      href="https://www.imdb.com/list/ls590630932/?ref_=uspf_t_5"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 group-hover:underline flex items-center gap-1"
                    >
                      Al·lucinació multisensorial ↗
                    </a>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    Històries molt audiovisuals.
                  </td>
                </tr>

                {/* Llista 6 */}
                <tr className="hover:bg-slate-800/60 transition group">
                  <td className="py-3 px-4 font-medium">
                    <a
                      href="https://www.imdb.com/list/ls4173543101/?ref_=uspf_t_1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 group-hover:underline flex items-center gap-1"
                    >
                      So ↗
                    </a>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    El so com a ofici o investigació (enginyers de so,
                    dissenyadors sonors, tècnics de Foley).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}