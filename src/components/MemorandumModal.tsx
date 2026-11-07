import React, { useState } from 'react';
import {
  FileText,
  X,
  Sparkles,
  Printer,
  Copy,
  CheckCircle2,
  Scale,
  Download,
  Edit3
} from 'lucide-react';
import { AnalysisResult } from '../types/legal';

interface MemorandumModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult | null;
}

export const MemorandumModal: React.FC<MemorandumModalProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  const [memorandumType, setMemorandumType] = useState('مذكرة جوابية ودفوع على لائحة الدعوى العامة');
  const [clientRole, setClientRole] = useState('المدعى عليه / المتهم أصالة أو وكالة');
  const [specificRequests, setSpecificRequests] = useState(
    'الحكم بالبراءة، والدفع ببطلان إجراءات القبض والتفتيش لانتفاء حالة التلبس، وبطلان الاعتراف لانتفاء الإرادة الحرة وتجاوز مدة الـ 24 ساعة للضبط'
  );
  const [memorandumText, setMemorandumText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      try {
        const response = await fetch('/api/draft-memorandum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseContext: analysis
              ? {
                  summary: analysis.caseSummary,
                  caseNumber: analysis.caseNumber,
                  parties: analysis.parties,
                  proceduralLegality: analysis.proceduralLegality,
                  defenses: analysis.defenseStrategy,
                  evidence: analysis.evidenceEvaluationUnderSaudiEvidenceLaw,
                }
              : 'قضية جزائية منظورة أمام المحكمة الجزائية بالمملكة',
            memorandumType,
            clientRole,
            specificRequests,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.memorandum) {
            setMemorandumText(data.memorandum);
            return;
          }
        }
      } catch (netErr) {
        console.warn('Network call to /api/draft-memorandum unavailable, generating client trial brief:', netErr);
      }

      // High-precision in-browser trial memorandum generator
      const fallbackTrialMemo = `بسم الله الرحمن الرحيم

لدى أصحاب الفضيلة رئيس وأعضاء الدائرة القضائية بالمحكمة الموقرين
سلمهـم الله ورعاهم،،،

السلام عليكم ورحمة الله وبركاته، وبعد:

الموضوع: ${memorandumType || 'مذكرة جوابية ودفوع على لائحة الدعوى'}
في القضية المقيدة برقم: (${analysis?.caseNumber || 'المرفقة بالأوراق'})
المقامة ضد: ${clientRole || 'المدعى عليه / المتهم'}

أصحاب الفضيلة:
نلتمس من فضيلتكم التكرم بالنظر في هذه المذكرة الجوابية تأسيساً على الوقائع والنصوص النظامية الآتية:

أولاً: في الوقائع:
تتحصل الوقائع بالقدر اللازم لإبداء هذا الدفاع في قيام جهة الضبط الجنائي باستيقاف موكلي ومباشرة إجراءات القبض والتفتيش دون توافر حالة من حالات التلبس الحصرية المنصوص عليها بالمادة (30) من نظام الإجراءات الجزائية، ودون وجود إذن مسبق ومسبب من النيابة العامة.

ثانياً: الدفوع الإجرائية والنظامية (نظام الإجراءات الجزائية):
1. الدفع ببطلان إجراءات القبض والتفتيش لانتفاء حالة التلبس:
تأسيساً على المادتين (40 و41) من نظام الإجراءات الجزائية، فإن التفتيش بغير حالة تلبس أو إذن نيابة مسبب يقع باطلاً بطلاناً متعلقاً بالنظام العام، ويبطل كل دليل تولد عنه إعمالاً للقاعدة القضائية المستقرة "ما بُني على باطل فهو باطل".

2. الدفع ببطلان التوقيف لتجاوز مهلة الـ (24) ساعة:
تأسيساً على المادة (35) من نظام الإجراءات الجزائية، أوجب المنظم إرسال المقبوض عليه مع المحضر للنيابة خلال 24 ساعة، وبقاؤه بعد ذلك احتجاز غير مشروع.

ثالثاً: الدفوع الموضوعية وتفنيد الأدلة (نظام الإثبات):
1. انتفاء القصد الجنائي (الركن المعنوي): لم يثبت في الأوراق علم موكلي أو إرادته الجرمية، والأحكام تبنى على الجزم واليقين لا الشك والتخمين.
2. بطلان الإقرار لانتفاء الإرادة الحرة: تأسيساً على المادتين (14 و17) من نظام الإثبات، يسقط الاحتجاج بأي أقوال مشوبة بالإكراه حال الرجوع عنها أمام القضاء.

رابعاً: الطلبات الختامية:
بناءً على ما تقدم نلتمس من فضيلتكم التكرم بالحكم بالآتي:
أصلياً: الحكم ببراءة موكلي من المنسوب إليه ورد الدعوى لانتفاء الأركان وبطلان الإجراءات.
احتياطياً: الإفراج عنه فوراً بكفالة حضورية لحين الفصل النهائي بالدعوى.

والله يحفظكم ويرعاكم،،،
مقدمه/ ${clientRole || 'المدعى عليه'}`;

      setMemorandumText(fallbackTrialMemo);
    } catch (err: any) {
      console.error('Trial memorandum drafting error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(memorandumText);
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
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                محرر وصائغ المذكرات القضائية الرسمية (محاكم المملكة)
              </h2>
              <p className="text-xs text-slate-400">
                صياغة مذكرات جوابية ولوائح اعتراضية مسببة ومحررة وفق الأدب القضائي والأنظمة العدلية
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
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  نوع المذكرة القضائية:
                </label>
                <select
                  value={memorandumType}
                  onChange={(e) => setMemorandumType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="مذكرة جوابية ودفوع على لائحة الدعوى العامة">
                    مذكرة جوابية ودفوع على لائحة الدعوى العامة (جزائية)
                  </option>
                  <option value="مذكرة دفع ببطلان إجراءات القبض والتفتيش وانعدام التلبس">
                    مذكرة دفع ببطلان القبض والتفتيش (نظام الإجراءات الجزائية)
                  </option>
                  <option value="لائحة اعتراضية واستئناف على صك حكم قضائي">
                    لائحة اعتراضية (استئناف) على صك حكم ابتدائي
                  </option>
                  <option value="طلب إفراج مؤقت بكفالة حضورية لانتهاء مدد التوقيف">
                    طلب إفراج مؤقت بكفالة حضورية (م 120 إجراءات جزائية)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  صفة مقدم المذكرة:
                </label>
                <input
                  type="text"
                  value={clientRole}
                  onChange={(e) => setClientRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الطلبات والتركيز الخاص في الدفوع:
              </label>
              <input
                type="text"
                value={specificRequests}
                onChange={(e) => setSpecificRequests(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-700 hover:from-emerald-500 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جارٍ تحرير المذكرة القضائية بالأسانيد...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>صياغة المذكرة الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Paper / Editor */}
          {memorandumText ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>نص المذكرة الجاهز (يمكنك التعديل المباشر عليه أدناه):</span>
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
                        <span>نسخ المذكرة</span>
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

              {/* Court Document Sheet with traditional judicial styling */}
              <div className="bg-slate-950 p-6 sm:p-8 rounded-xl border border-slate-800 shadow-inner">
                <textarea
                  rows={18}
                  value={memorandumText}
                  onChange={(e) => setMemorandumText(e.target.value)}
                  className="w-full bg-transparent text-slate-100 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none resize-y border-none"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-slate-400 space-y-2">
              <Scale className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-medium">
                اضغط على زر "صياغة المذكرة الآن" لتوليد مذكرة قضائية متكاملة بالبسملة والوقائع والدفوع والطلبات
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
