import React, { useState } from 'react';
import {
  FileText,
  X,
  Sparkles,
  Printer,
  Copy,
  CheckCircle2,
  Scale,
  Gavel,
  Clock,
  Edit3,
  AlertTriangle
} from 'lucide-react';
import { DetailedDeedAnalysis } from '../types/legal';

interface AppealBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  deed: DetailedDeedAnalysis | null;
}

export const AppealBriefModal: React.FC<AppealBriefModalProps> = ({
  isOpen,
  onClose,
  deed,
}) => {
  const [appellantRole, setAppellantRole] = useState(
    'المستأنف (المدعى عليه / المحكوم ضده أصالة أو وكالة)'
  );
  const [focusDefects, setFocusDefects] = useState(
    'الطعن بالقصور في التسبيب، والخطأ في تطبيق وتأويل نصوص نظام الإثبات، والفساد في الاستدلال، وطلب نقض الحكم وإلغائه'
  );
  const [appealBriefText, setAppealBriefText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !deed) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-appeal-memorandum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detailedDeed: deed,
          appellantRole,
          focusDefects,
        }),
      });

      const data = await response.json();
      if (data.success && data.appealMemorandum) {
        setAppealBriefText(data.appealMemorandum);
      } else {
        alert(data.error || 'تعذر توليد اللائحة الاعتراضية الاستئنافية');
      }
    } catch (err: any) {
      alert(`خطأ أثناء الصياغة: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(appealBriefText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>صائغ اللائحة الاعتراضية الاستئنافية (محاكم الاستئناف)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  مهلة {deed.appealDeadline.daysAllowed} يوماً
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                صياغة مسببة تستند للثغرات المرصودة في تسبيب صك الحكم رقم ({deed.deedNumber})
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Controls Bar */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">المحكمة والدائرة المصدرة للحكم المستأنف:</span>
                <div className="bg-slate-900 p-2.5 rounded-lg text-slate-200 border border-slate-800 font-semibold truncate">
                  {deed.courtName} ({deed.circuitName})
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">الميعاد والسند النظامي للاستئناف:</span>
                <div className="bg-slate-900 p-2.5 rounded-lg text-amber-300 border border-slate-800 font-semibold truncate">
                  {deed.appealDeadline.daysAllowed} يوماً ({deed.appealDeadline.statutoryBasis})
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                صفة المستأنف أمام محكمة الاستئناف:
              </label>
              <input
                type="text"
                value={appellantRole}
                onChange={(e) => setAppellantRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                محاور الطعن الاستئنافي والتركيز في العيوب الموضوعية والتسبيب:
              </label>
              <input
                type="text"
                value={focusDefects}
                onChange={(e) => setFocusDefects(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-700 hover:from-amber-500 hover:to-emerald-600 text-white font-bold text-xs shadow-md shadow-amber-950 flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جارٍ صياغة اللائحة الاعتراضية الاستئنافية...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>توليد مسودة اللائحة الاعتراضية الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Appellate Brief Sheet */}
          {appealBriefText ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>مسودة اللائحة الاعتراضية الجاهزة (يمكن التعديل عليها مباشرة):</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ اللائحة</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>طباعة</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-6 sm:p-8 rounded-xl border border-slate-800 shadow-inner">
                <textarea
                  rows={18}
                  value={appealBriefText}
                  onChange={(e) => setAppealBriefText(e.target.value)}
                  className="w-full bg-transparent text-slate-100 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none resize-y border-none"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-slate-400 space-y-2">
              <Gavel className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-medium">
                اضغط على زر "توليد مسودة اللائحة الاعتراضية الآن" لبناء لائحة استئناف رسمية تستند مباشرة للثغرات والقصور في تسبيب الصك
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
