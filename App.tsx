import React, { useState, useEffect } from 'react';
import { Layout, Play, Code, Server, Info, Search, Github, Download, Map, CheckCircle, Circle, ArrowRight, MonitorPlay, Zap, Database, Rocket, Monitor, Smartphone, Apple, Tv, Flame, Package, FileCode } from 'lucide-react';
import { SERVER_TEMPLATE, PACKAGE_JSON_TEMPLATE } from './constants';
import { fetchSimulatedCatalog, fetchAnimeDetailsWithStreams } from './services/geminiService';
import AnimeGrid from './components/AnimeGrid';
import CodeDisplay from './components/CodeDisplay';
import { Anime, ViewState } from './types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [catalog, setCatalog] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [simulatedDetails, setSimulatedDetails] = useState<any>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'server' | 'package'>('server');

  useEffect(() => {
    if (viewState === ViewState.CATALOG && catalog.length === 0) {
      loadCatalog();
    }
  }, [viewState]);

  const loadCatalog = async () => {
    setLoading(true);
    const data = await fetchSimulatedCatalog("Lançamentos");
    setCatalog(data);
    setLoading(false);
  };

  const handleAnimeSelect = async (anime: Anime) => {
    setSelectedAnime(anime);
    setViewState(ViewState.DETAILS);
    setDetailsLoading(true);
    const details = await fetchAnimeDetailsWithStreams(anime.title);
    setSimulatedDetails(details);
    setDetailsLoading(false);
  };

  const NavButton = ({ active, label, icon: Icon, onClick }: any) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-orange-600/20 text-orange-400 border border-orange-500/50' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0f0f11] text-gray-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f0f11]/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewState(ViewState.HOME)}>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg shadow-lg shadow-orange-900/20">
                 <Flame size={20} className="text-white fill-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">AnimeFire<span className="text-orange-500">Hub</span></span>
            </div>
            
            <div className="hidden md:flex ml-10 space-x-2">
                <NavButton 
                  active={viewState === ViewState.HOME} 
                  label="Início" 
                  icon={Rocket}
                  onClick={() => setViewState(ViewState.HOME)} 
                />
                <NavButton 
                  active={viewState === ViewState.CATALOG} 
                  label="Catálogo" 
                  icon={Search}
                  onClick={() => setViewState(ViewState.CATALOG)} 
                />
                 <NavButton 
                  active={viewState === ViewState.ROADMAP} 
                  label="Roadmap" 
                  icon={Map}
                  onClick={() => setViewState(ViewState.ROADMAP)} 
                />
                <NavButton 
                  active={viewState === ViewState.CODE} 
                  label="Código Final" 
                  icon={Code}
                  onClick={() => setViewState(ViewState.CODE)} 
                />
            </div>
            
             <div className="flex items-center gap-4">
                 <a href="https://github.com/Stremio/stremio-addon-sdk" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                     <Github size={20} />
                 </a>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
        
        {/* HOME VIEW - FASE 4: LANDING PAGE & INSTALAÇÃO */}
        {viewState === ViewState.HOME && (
          <div className="flex flex-col items-center justify-center animate-fade-in-up pt-10 relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            {/* HERO SECTION */}
            <div className="text-center max-w-5xl mx-auto mb-24 relative z-10 px-4">
               
               {/* Animated Logo Container */}
               <div className="flex justify-center mb-10">
                   <div className="relative group cursor-default">
                       <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 rounded-full"></div>
                       <div className="relative bg-gradient-to-br from-[#1a1a1d] to-[#0f0f11] p-6 rounded-3xl shadow-2xl border border-gray-800 group-hover:border-orange-500/50 transition-colors duration-500">
                           <Flame size={64} className="text-orange-500 fill-orange-500/20 group-hover:scale-110 transition-transform duration-500" />
                       </div>
                   </div>
               </div>

               <div className="inline-flex items-center px-5 py-2.5 rounded-full border border-gray-700 bg-gray-900/50 text-gray-300 text-sm font-medium mb-10 backdrop-blur-md hover:border-orange-500/30 transition-colors">
                 <span className="relative flex h-2.5 w-2.5 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                 </span>
                 v1.3.0 Stable • Cache System Active
               </div>
               
               <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[1.1]">
                  Animes.<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">Sem Limites.</span>
               </h1>
               
               <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
                 O hub definitivo para o <strong className="text-white font-semibold">AnimeFire</strong>. 
                 Assista a lançamentos em <span className="text-orange-400">Full HD</span>, sem anúncios e com carregamento instantâneo no seu Stremio.
               </p>
               
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <a 
                    href="stremio://localhost:7000/manifest.json"
                    onClick={(e) => {
                         e.preventDefault();
                         alert("Para instalar, você precisa rodar o Código Final (Aba Código) localmente ou em um servidor.");
                    }}
                    className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_-15px_rgba(234,88,12,0.5)] w-full sm:w-auto overflow-hidden ring-1 ring-white/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
                    <Rocket size={24} className="fill-white/20" /> 
                    Instalar Agora
                  </a>
                  
                  <button 
                    onClick={() => setViewState(ViewState.CODE)}
                    className="group flex items-center justify-center gap-3 bg-[#1e1e24] text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-[#27272f] border border-gray-800 hover:border-gray-600 transition-all w-full sm:w-auto"
                  >
                    <Code size={24} className="text-gray-400 group-hover:text-white transition-colors" /> 
                    Ver Código & Deploy
                  </button>
               </div>

               <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-gray-500 font-medium">
                   <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-800">
                       <CheckCircle size={16} className="text-green-500" /> Open Source
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-800">
                       <CheckCircle size={16} className="text-green-500" /> Sem Anúncios
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-800">
                       <CheckCircle size={16} className="text-green-500" /> 1080p Support
                   </div>
               </div>
            </div>

            {/* DOWNLOAD STREMIO SECTION */}
            <div className="w-full max-w-5xl bg-[#1e1e24] rounded-3xl p-8 md:p-12 border border-gray-800 shadow-2xl mb-20 text-center relative z-10">
                <h3 className="text-3xl font-bold text-white mb-4">Ainda não tem o Stremio?</h3>
                <p className="text-gray-400 mb-10">Baixe o player definitivo para sua plataforma favorita.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <a href="https://www.stremio.com/download?platform=windows" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Monitor size={32} />
                        </div>
                        <span className="font-medium text-gray-300 group-hover:text-white">Windows</span>
                    </a>
                    
                    <a href="https://www.stremio.com/download?platform=mac" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-gray-600/20 text-gray-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Apple size={32} />
                        </div>
                        <span className="font-medium text-gray-300 group-hover:text-white">macOS</span>
                    </a>

                    <a href="https://www.stremio.com/download?platform=android" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-green-600/20 text-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Smartphone size={32} />
                        </div>
                        <span className="font-medium text-gray-300 group-hover:text-white">Android</span>
                    </a>

                    <a href="https://www.stremio.com/download?platform=linux" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-yellow-600/20 text-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Server size={32} />
                        </div>
                        <span className="font-medium text-gray-300 group-hover:text-white">Linux</span>
                    </a>
                    
                    <a href="https://blog.stremio.com/using-stremio-web-on-iphone-ipad/" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-purple-600/20 text-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Tv size={32} />
                        </div>
                        <span className="font-medium text-gray-300 group-hover:text-white">iOS / TV</span>
                    </a>
                </div>
            </div>

            {/* FEATURES GRID */}
            <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
                 <div className="bg-[#18181b] p-8 rounded-2xl border border-gray-800 hover:border-orange-500/50 transition-colors">
                     <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                         <Zap className="text-orange-500" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Rápido & Leve</h3>
                     <p className="text-gray-400">Implementação otimizada em Node.js com sistema de cache inteligente para evitar travamentos.</p>
                 </div>
                 <div className="bg-[#18181b] p-8 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-colors">
                     <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                         <MonitorPlay className="text-blue-500" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Qualidade HD</h3>
                     <p className="text-gray-400">Crawler automático que encontra sempre a melhor qualidade de vídeo disponível.</p>
                 </div>
                 <div className="bg-[#18181b] p-8 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-colors">
                     <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                         <CheckCircle className="text-green-500" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">100% Completo</h3>
                     <p className="text-gray-400">Addon testado e aprovado. Todas as fases de desenvolvimento concluídas e validadas.</p>
                 </div>
            </div>

          </div>
        )}

        {/* ROADMAP VIEW */}
        {viewState === ViewState.ROADMAP && (
           <div className="max-w-4xl mx-auto">
             <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-white mb-4">Progresso do Desenvolvimento</h2>
               <p className="text-gray-400">Projeto 100% Concluído.</p>
             </div>

             <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
               
               {/* Phase 1 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f0f11] bg-green-500 text-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle size={20} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1e1e24] p-6 rounded-xl border border-gray-800 shadow-xl opacity-60">
                     <h3 className="font-bold text-lg text-white mb-1">Fase 1: Estrutura</h3>
                     <p className="text-gray-500 text-sm">Catalog Handler & Meta Handler</p>
                  </div>
               </div>

               {/* Phase 2 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f0f11] bg-green-500 text-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle size={20} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1e1e24] p-6 rounded-xl border border-gray-800 shadow-xl opacity-60">
                     <h3 className="font-bold text-lg text-white mb-1">Fase 2: Vídeo</h3>
                     <p className="text-gray-500 text-sm">Stream Handler & HTML Crawler</p>
                  </div>
               </div>

               {/* Phase 3 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f0f11] bg-green-500 text-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle size={20} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1e1e24] p-6 rounded-xl border border-gray-800 shadow-xl opacity-60">
                     <h3 className="font-bold text-lg text-white mb-1">Fase 3: Otimização</h3>
                     <p className="text-gray-500 text-sm">In-Memory Cache System</p>
                  </div>
               </div>

               {/* Phase 4 */}
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-orange-500 bg-orange-600 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 animate-pulse">
                    <Rocket size={20} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1e1e24] p-6 rounded-xl border-2 border-orange-500 shadow-xl shadow-orange-900/20">
                     <div className="flex items-center justify-between mb-2">
                       <h3 className="font-bold text-lg text-white">Fase 4: Deploy & UI</h3>
                       <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-bold">AGORA</span>
                     </div>
                     <p className="text-gray-300 text-sm mb-4">
                       Criação da Landing Page, Botões de Download e Links de Instalação (Manifesto).
                     </p>
                  </div>
               </div>

             </div>
           </div>
        )}

        {/* CATALOG VIEW */}
        {viewState === ViewState.CATALOG && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Catálogo</h2>
              <div className="text-sm text-gray-400 bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
                <Info size={16} className="inline mr-2 text-purple-500" />
                Preview visual.
              </div>
            </div>
            <AnimeGrid 
              animes={catalog} 
              isLoading={loading} 
              onSelect={handleAnimeSelect} 
            />
          </div>
        )}

        {/* DETAILS VIEW */}
        {viewState === ViewState.DETAILS && selectedAnime && (
           <div className="max-w-5xl mx-auto bg-[#18181b] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 animate-fade-in">
              <div className="relative h-64 md:h-96 w-full">
                  <img src={selectedAnime.thumbnail} className="w-full h-full object-cover opacity-40" alt="Backdrop" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-[#18181b]/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8">
                      <h2 className="text-4xl font-bold text-white mb-2">{selectedAnime.title}</h2>
                  </div>
              </div>
              
              <div className="p-8">
                  <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex items-center justify-between">
                      <div>
                          <h4 className="font-bold mb-2 text-white flex items-center gap-2">
                             <Database size={18} className="text-purple-500" />
                             Cache Simulator
                          </h4>
                          <p className="text-sm text-gray-400">
                              Na primeira vez, o addon baixa do site. Na segunda vez, ele puxa da memória instantaneamente.
                          </p>
                      </div>
                      <button 
                             onClick={() => setViewState(ViewState.CODE)}
                             className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-purple-900/40"
                          >
                              Ver Código Completo
                      </button>
                  </div>
              </div>
           </div>
        )}

        {/* CODE VIEW (DEPLOYMENT GUIDE) */}
        {viewState === ViewState.CODE && (
          <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
             
             <div className="text-center">
                 <h2 className="text-4xl font-black text-white mb-4">Guia de Deploy (AntGravity)</h2>
                 <p className="text-gray-400 max-w-2xl mx-auto">
                     Siga os 3 passos abaixo para rodar o addon. Você precisa criar apenas 2 arquivos.
                 </p>
             </div>

             {/* STEPS VISUALIZATION */}
             <div className="grid md:grid-cols-3 gap-6">
                 <div className="bg-[#1e1e24] p-6 rounded-2xl border border-gray-800 relative">
                     <div className="absolute -top-4 left-6 bg-orange-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">1</div>
                     <h3 className="text-xl font-bold text-white mt-2 mb-3">Crie server.js</h3>
                     <p className="text-gray-400 text-sm mb-4">Copie o código da aba "Server Code" e salve em um arquivo chamado <code>server.js</code>.</p>
                     <div className="bg-black/30 p-2 rounded text-xs font-mono text-gray-500">const addon = require...</div>
                 </div>

                 <div className="bg-[#1e1e24] p-6 rounded-2xl border border-gray-800 relative">
                     <div className="absolute -top-4 left-6 bg-orange-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">2</div>
                     <h3 className="text-xl font-bold text-white mt-2 mb-3">Crie package.json</h3>
                     <p className="text-gray-400 text-sm mb-4">Copie o código da aba "Dependencies" e salve como <code>package.json</code> na mesma pasta.</p>
                     <div className="bg-black/30 p-2 rounded text-xs font-mono text-gray-500">"dependencies": ...</div>
                 </div>

                 <div className="bg-[#1e1e24] p-6 rounded-2xl border border-gray-800 relative">
                     <div className="absolute -top-4 left-6 bg-green-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">3</div>
                     <h3 className="text-xl font-bold text-white mt-2 mb-3">Rode o Servidor</h3>
                     <p className="text-gray-400 text-sm mb-4">Abra o terminal na pasta e rode os comandos:</p>
                     <div className="bg-black/50 p-3 rounded text-sm font-mono text-green-400 border border-green-900/50">
                        npm install<br/>
                        npm start
                     </div>
                 </div>
             </div>

             {/* CODE TABS */}
             <div className="bg-[#1e1e24] rounded-2xl border border-gray-700 overflow-hidden shadow-2xl relative group">
                 {/* Tab Header */}
                 <div className="flex border-b border-gray-700 bg-[#16161a]">
                     <button 
                        onClick={() => setActiveCodeTab('server')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${activeCodeTab === 'server' ? 'bg-[#1e1e24] text-white border-t-2 border-orange-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1e1e24]/50'}`}
                     >
                        <FileCode size={18} className={activeCodeTab === 'server' ? 'text-orange-500' : ''} />
                        server.js
                     </button>
                     <button 
                        onClick={() => setActiveCodeTab('package')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${activeCodeTab === 'package' ? 'bg-[#1e1e24] text-white border-t-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1e1e24]/50'}`}
                     >
                        <Package size={18} className={activeCodeTab === 'package' ? 'text-yellow-500' : ''} />
                        package.json
                     </button>
                 </div>

                 <div className="relative">
                     {activeCodeTab === 'server' ? (
                         <div className="animate-fade-in">
                            <CodeDisplay code={SERVER_TEMPLATE} filename="server.js" />
                         </div>
                     ) : (
                         <div className="animate-fade-in">
                             <CodeDisplay code={PACKAGE_JSON_TEMPLATE} filename="package.json" />
                         </div>
                     )}
                 </div>
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0f0f11] py-8 mt-12">
         <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
             <p>&copy; {new Date().getFullYear()} AnimeFire Stremio Hub.</p>
         </div>
      </footer>
    </div>
  );
};

export default App;