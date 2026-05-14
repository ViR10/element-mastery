import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Info, FlaskConical, Beaker, Zap, Wind, Link as LinkIcon, ChevronRight } from 'lucide-react';
import { METALS, NONMETALS, NOBLE, RADICALS } from '../data/elements';

const ALL_DATA = [
  ...METALS.map(m => ({ ...m, type: 'metal' })),
  ...NONMETALS.map(n => ({ ...n, type: 'nonmetal' })),
  ...NOBLE.map(b => ({ ...b, type: 'noble' })),
  ...RADICALS.map(r => ({ ...r, type: 'radical' }))
];

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  metal: { label: 'Metals', icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50' },
  nonmetal: { label: 'Non-Metals', icon: Beaker, color: 'text-rose-600', bg: 'bg-rose-50' },
  noble: { label: 'Noble Gases', icon: Wind, color: 'text-slate-600', bg: 'bg-slate-50' },
  radical: { label: 'Radicals', icon: LinkIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export default function Reference() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'metal' | 'nonmetal' | 'noble' | 'radical'>('all');
  const [selectedElement, setSelectedElement] = useState<any>(null);

  const filteredData = useMemo(() => {
    return ALL_DATA.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                           item.symbol.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'all' || item.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [search, activeTab]);

  return (
    <div className="flex flex-col h-full space-y-6 pb-20">
      {/* Header & Search */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Chemical Library</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Verified Valency Reference Guide</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search element or symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-500 outline-none transition-all shadow-sm text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {(['all', 'metal', 'nonmetal', 'noble', 'radical'] as const).map((tab) => {
          const config = TYPE_CONFIG[tab] || { label: 'All Items', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' };
          const isActive = activeTab === tab;
          const Icon = config.icon;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-xs font-bold transition-all border-2 ${
                isActive 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-white dark:bg-gray-800 border-gray-50 dark:border-gray-700 text-gray-500 hover:border-gray-200'
              }`}
            >
              <Icon size={14} strokeWidth={2.5} />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map((item, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              key={`${item.type}-${item.symbol}`}
              onClick={() => setSelectedElement(item)}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group cursor-pointer hover:border-indigo-300 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-lg ${TYPE_CONFIG[item.type].bg} ${TYPE_CONFIG[item.type].color}`}>
                  {item.symbol}
                </div>
                <div>
                  <div className="font-bold text-gray-800 dark:text-white text-sm leading-tight">{item.name}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{TYPE_CONFIG[item.type].label}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">{item.valency}</div>
                  <div className="text-[9px] text-gray-400 font-bold">VALENCY</div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <Search size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-400">No matching elements found</p>
          </div>
        )}
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedElement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className={`h-32 bg-gradient-to-br ${selectedElement.type === 'metal' ? 'from-blue-400 to-indigo-600' : selectedElement.type === 'nonmetal' ? 'from-rose-400 to-pink-600' : 'from-emerald-400 to-teal-600'} flex items-center justify-center relative`}>
                <button 
                  onClick={() => setSelectedElement(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-white font-bold transition-colors"
                >
                  ✕
                </button>
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-mono font-black text-3xl text-white shadow-lg">
                  {selectedElement.symbol}
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none">{selectedElement.name}</h3>
                  <p className="text-xs font-bold text-indigo-500 mt-2 uppercase tracking-widest">{TYPE_CONFIG[selectedElement.type].label}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Valency</span>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">{selectedElement.valency}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Source</span>
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1 truncate">{selectedElement.source || 'Standard'}</div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-2">
                    <Info size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Mnemonic / Note</span>
                  </div>
                  <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                    {selectedElement.note}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedElement(null)}
                  className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-lg transition-transform active:scale-95"
                >
                  CLOSE PREVIEW
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
