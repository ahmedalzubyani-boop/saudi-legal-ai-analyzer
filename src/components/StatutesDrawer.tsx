import React, { useState, useEffect } from 'react';
import { BookOpen, X, Search, Copy, CheckCircle2, ChevronRight, Scale, Bookmark } from 'lucide-react';
import { StatuteCategory } from '../types/legal';

interface StatutesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatutesDrawer: React.FC<StatutesDrawerProps> = ({ isOpen, onClose }) => {
  const [statutes, setStatutes] = useState<StatuteCategory[]>([]);
  const [selectedStatuteId, setSelectedStatuteId] = useState<string>('cpl');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && statutes.length === 0) {
      fetch('/api/statutes')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.statutes) {
            setStatutes(data.statutes);
          }
        })
        .catch((err) => console.error('Failed to load statutes', err));
    }
  }, [isOpen, statutes.length]);

  if (!isOpen) return null;

  const currentStatute = statutes.find((s) => s.id === selectedStatuteId) || statutes[0];

  const filteredArticles = currentStatute
    ? currentStatute.articles.filter((art) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          art.number.toString().includes(query) ||
          art.title.toLowerCase().includes(query) ||
          art.text.toLowerCase().includes(query)
        );
      })
    : [];

  const handleCopyArticle = (articleNumber: number, title: string, text: string) => {
    const citation = `المادة (${articleNumber}) - [${title}] من ${currentStatute.name} (${currentStatute.enactment}):\n"${text}"`;
    navigator.clipboard.writeText(citation);
    setCopiedKey(`${selectedStatuteId}-${articleNumber}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border-r border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                مستعرض الأنظمة واللوائح العدلية السعودية
              </h2>
              <p className="text-[11px] text-slate-400">
                قاعدة بيانات نصوص مواد الإجراءات الجزائية والإثبات والأنظمة الموضوعية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statute Tabs */}
        <div className="flex items-center gap-1.5 p-3 bg-slate-950/50 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {statutes.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatuteId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedStatuteId === s.id
                  ? 'bg-emerald-800/60 text-emerald-200 border border-emerald-700/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>{s.name}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم المادة أو الكلمة المفتاحية (مثل: تلبس، تفتيش، إقرار، ٢٤ ساعة)..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pr-9 pl-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Articles List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentStatute && (
            <div className="mb-2 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
              <span>{currentStatute.enactment}</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                {currentStatute.category}
              </span>
            </div>
          )}

          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              لم يتم العثور على مواد مطابقة للبحث
            </div>
          ) : (
            filteredArticles.map((art) => {
              const key = `${selectedStatuteId}-${art.number}`;
              return (
                <div
                  key={art.number}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-700/50 text-emerald-300 font-mono text-xs flex items-center justify-center font-bold">
                        {art.number}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                        المادة ({art.number}): {art.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyArticle(art.number, art.title, art.text)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300 px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors"
                      title="نسخ نص المادة بالصيغة القضائية"
                    >
                      {copiedKey === key ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ المادة</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans pr-8">
                    {art.text}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
