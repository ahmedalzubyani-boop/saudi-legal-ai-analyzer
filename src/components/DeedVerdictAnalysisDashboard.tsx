import React, { useState } from 'react';
import {
  Gavel,
  Scale,
  Calendar,
  Building2,
  Hash,
  Users,
  FileCheck2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Printer,
  BadgeAlert,
  ArrowRight,
  ShieldAlert,
  Bookmark,
  HeartHandshake
} from 'lucide-react';
import { DetailedDeedAnalysis, AnalysisResult } from '../types/legal';

interface DeedVerdictAnalysisDashboardProps {
  analysis: AnalysisResult;
  onOpenAppealGenerator: (deed: DetailedDeedAnalysis) => void;
}

export const DeedVerdictAnalysisDashboard: React.FC<DeedVerdictAnalysisDashboardProps> = ({
  analysis,
  onOpenAppealGenerator,
}) => {
  const deed = analysis.detailedDeed;
  const deedVerdict = analysis.deedVerdict;

  const [activeDeedTab, setActiveDeedTab] = useState<
    'deed_meta' | 'facts_claims' | 'reasoning_grounds' | 'verdict_pronouncement' | 'appeal_deadline'
  >('verdict_pronouncement');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!deed && !deedVerdict) {
    return null;
  }

  // Fallback deed structure if detailedDeed wasn't fully returned
  const effectiveDeed: DetailedDeedAnalysis = deed || {
    isDeed: true,
    courtName: deedVerdict?.courtName || analysis.jurisdiction || 'المحكمة المختصة',
    courtLocation: 'المملكة العربية السعودية',
    circuitType: (analysis.jurisdiction?.includes('تجارية')
      ? 'تجارية'
      : analysis.jurisdiction?.includes('جزائية')
      ? 'جزائية'
      : analysis.jurisdiction?.includes('عمالية')
      ? 'عمالية'
      : analysis.jurisdiction?.includes('أحوال')
      ? 'أحوال شخصية'
      : 'عامة') as any,
    circuitName: analysis.jurisdiction || 'الدائرة القضائية المختصة',
    deedNumber: analysis.caseNumber || 'مدون في الصك',
    deedDate: analysis.caseDate || '1445هـ',
    originalCaseNumber: analysis.caseNumber || 'مدون في الصك',
    parties: {
      plaintiffs: analysis.parties.filter((p) => p.role.includes('مدعي') && !p.role.includes('عليه')),
      defendants: analysis.parties.filter((p) => p.role.includes('مدعى عليه') || p.role.includes('متهم')),
      publicProsecutor: analysis.parties.find((p) => p.role.includes('مدعي عام')),
    },
    caseFacts: {
      claimSummary: analysis.caseSummary || 'مطالبة المدعي وفق لائحة الدعوى المقدمة للمحكمة.',
      responseSummary: 'إنكار المدعى عليه ودفوعه المقيدة بمحضر الجلسة.',
      defensesPresented: analysis.defenseStrategy?.substantiveDefenses?.map((d) => d.defense) || [
        'الدفع بعدم كفاية الأدلة واعتصام المدعى عليه بأصل براءة الذمة.',
      ],
    },
    reasoningAndGrounds: {
      judicialGrounds:
        deedVerdict?.judicialGrounds?.map((g) => ({
          groundText: g,
          statuteArticle: 'الأنظمة العدلية ذات الصلة',
          evaluation: 'تسبيب محكم',
          rebuttalForAppeal: 'الطعن بالقصور في التسبيب وإغفال مناقشة دفوع جوهرية.',
        })) || [],
      statutoryArticlesApplied: ['نظام الإثبات', 'نظام المرافعات الشرعية'],
      reasoningDefects: [
        'شبهة قصور في التسبيب لعدم الرد على دفع جوهري أثاره الخصم.',
        'التمسك بعدم كفاية البينة المستند إليها منطوق الحكم.',
      ],
    },
    verdict: {
      pronouncedText: deedVerdict?.verdictText || 'منطوق الحكم القضائي الصادر عن الدائرة.',
      classification: (deedVerdict?.verdictText?.includes('براءة')
        ? 'براءة'
        : deedVerdict?.verdictText?.includes('رد')
        ? 'رد دعوى'
        : deedVerdict?.verdictText?.includes('إدانة')
        ? 'إدانة'
        : 'إلزام مالي') as any,
      executability: deedVerdict?.legalStatus || 'حكم ابتدائي خاضع للاستئناف',
    },
    appealDeadline: {
      daysAllowed: 30,
      verdictType: 'حكم عادي',
      statutoryBasis: 'المادة (187) من نظام المرافعات الشرعية والمادة (194) من نظام الإجراءات الجزائية',
      deadlineNotes:
        'الميعاد النظامي لتقديم لائحة الاعتراض بالاستئناف هو (30) يوماً تبدأ من اليوم التالي لتسليم صورة الصك عبر بوابة ناجز، ويسقط الحق بفوات الميعاد.',
      isUrgent: false,
    },
    appealStrategicPoints: [
      'الطعن بالقصور في التسبيب لإغفال الدائرة القضائية الرد على الدفع الشكلي الجوهري.',
      'الطعن بالخطأ في تطبيق وتأويل نصوص نظام الإثبات ونظام المرافعات.',
    ],
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getCircuitBadge = (circuit: string) => {
    switch (circuit) {
      case 'تجارية':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'جزائية':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'عمالية':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'أحوال شخصية':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'براءة':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'رد دعوى':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'إدانة':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'إلزام مالي':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-5 p-5 sm:p-7">
      {/* Top Banner: Court Deed Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 p-4 sm:p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${getCircuitBadge(
                effectiveDeed.circuitType
              )}`}
            >
              المحكمة ال{effectiveDeed.circuitType} • {effectiveDeed.courtLocation}
            </span>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${getClassificationBadge(
                effectiveDeed.verdict.classification
              )}`}
            >
              تصنيف الحكم: {effectiveDeed.verdict.classification}
            </span>

            {effectiveDeed.appealDeadline.isUrgent && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                حكم مستعجل (10 أيام للاستئناف)
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-400" />
            <span>صك حكم قضائي: {effectiveDeed.courtName}</span>
          </h3>

          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span>
              رقم الصك: <strong className="text-slate-200 font-mono">{effectiveDeed.deedNumber}</strong>
            </span>
            <span>•</span>
            <span>
              رقم القضية الأساسية: <strong className="text-slate-200 font-mono">{effectiveDeed.originalCaseNumber}</strong>
            </span>
            <span>•</span>
            <span>
              تاريخ الصك: <strong className="text-slate-200 font-mono">{effectiveDeed.deedDate}</strong>
            </span>
          </div>
        </div>

        {/* Generate Appeal Brief Button */}
        <div className="shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => onOpenAppealGenerator(effectiveDeed)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-700 hover:from-amber-500 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-950 flex items-center gap-2 transition-all border border-amber-400/30"
          >
            <HeartHandshake className="w-4 h-4 text-amber-200" />
            <span>توليد لائحة الاعتراض للمدعى عليه</span>
          </button>
        </div>
      </div>

      {/* Deed Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveDeedTab('verdict_pronouncement')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeDeedTab === 'verdict_pronouncement'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          <span>منطوق صك الحكم</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeedTab('appeal_deadline')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeDeedTab === 'appeal_deadline'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-300" />
          <span>مدد الاعتراض بالاستئناف ({effectiveDeed.appealDeadline.daysAllowed} يوماً)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeedTab('reasoning_grounds')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeDeedTab === 'reasoning_grounds'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>أسباب وتسبيب الحكم والثغرات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeedTab('facts_claims')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeDeedTab === 'facts_claims'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>وقائع الدعوى والدفوع</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeedTab('deed_meta')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeDeedTab === 'deed_meta'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>أطراف الدعوى وبيانات الصك</span>
        </button>
      </div>

      {/* Tab 1: Verdict Pronouncement (منطوق الحكم) */}
      {activeDeedTab === 'verdict_pronouncement' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-5 sm:p-6 rounded-2xl border border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-400" />
                <span>نص منطوق الحكم القضائي بحرفيته:</span>
              </span>

              <button
                type="button"
                onClick={() => handleCopy(effectiveDeed.verdict.pronouncedText, 'verdict')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-900 border border-slate-800"
              >
                {copiedKey === 'verdict' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>نسخ المنطوق</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 p-4 rounded-xl border border-slate-800 text-sm sm:text-base font-semibold text-slate-100 leading-relaxed font-sans">
              {effectiveDeed.verdict.pronouncedText}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>الصفة الإجرائية: {effectiveDeed.verdict.executability}</span>
              <span className="text-emerald-400 font-mono">
                صادر طبقاً للأنظمة القضائية السعودية
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Appeal Deadline (مدد الاعتراض بالاستئناف) */}
      {activeDeedTab === 'appeal_deadline' && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-5 sm:p-6 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-mono text-xl font-bold">
                  {effectiveDeed.appealDeadline.daysAllowed}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    ميعاد الاعتراض بطلب الاستئناف: ({effectiveDeed.appealDeadline.daysAllowed}) يوماً
                  </h4>
                  <p className="text-xs text-amber-300 font-medium">
                    السند النظامي: {effectiveDeed.appealDeadline.statutoryBasis}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 border border-amber-700/50 text-amber-300">
                {effectiveDeed.appealDeadline.verdictType}
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
              <p>{effectiveDeed.appealDeadline.deadlineNotes}</p>
              <div className="text-[11px] text-amber-400 font-semibold pt-1">
                تنبيه نظامي حاسم: انقضاء مهلة الـ ({effectiveDeed.appealDeadline.daysAllowed}) يوماً يسقط الحق في الاعتراض نهائياً، ويكتسب الحكم الصفة القطعية وتذييل السند التنفيذي وفق المادة (187 مرافعات / 194 إجراءات جزائية).
              </div>
            </div>

            {/* Appeal Strategic Attack Points */}
            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>نقاط الطعن الاستئنافية المقترحة للنقض:</span>
              </h5>
              <div className="space-y-2">
                {effectiveDeed.appealStrategicPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900 border border-emerald-900/30 text-xs text-slate-300 flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Reasoning and Grounds (أسباب وتسبيب الحكم وكشف الثغرات) */}
      {activeDeedTab === 'reasoning_grounds' && (
        <div className="space-y-5">
          {/* Reasoning Defects / Loopholes */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>الثغرات والقصور في تسبيب الحكم (محاور الطعن بالاستئناف):</span>
            </h4>
            <div className="space-y-2">
              {effectiveDeed.reasoningAndGrounds.reasoningDefects.map((defect, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/30 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{defect}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Grounds Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>الأسس الشرعية والنظامية ومواد الأنظمة التي بنى عليها القاضي قراره:</span>
            </h4>

            <div className="space-y-3">
              {effectiveDeed.reasoningAndGrounds.judicialGrounds.map((ground, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-300 font-mono text-[11px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span>{ground.groundText}</span>
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 shrink-0">
                      {ground.statuteArticle || 'مبادئ القضاء'}
                    </span>
                  </div>

                  {ground.rebuttalForAppeal && (
                    <div className="text-[11px] bg-slate-900/90 border border-amber-900/30 p-2.5 rounded-lg text-amber-200/90 space-y-0.5">
                      <span className="font-bold text-amber-400 block text-[10px]">
                        الثغرة الاستئنافية للرد على هذا السبب:
                      </span>
                      <p>{ground.rebuttalForAppeal}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Facts and Claims (وقائع الدعوى والدفوع) */}
      {activeDeedTab === 'facts_claims' && (
        <div className="space-y-4">
          {/* Claim Summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4" />
              <span>وقائع دعوى المدعي وطلباته الختامية:</span>
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              {effectiveDeed.caseFacts.claimSummary}
            </p>
          </div>

          {/* Response Summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>جواب المدعى عليه والدفوع الموضوعية والشكلية:</span>
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              {effectiveDeed.caseFacts.responseSummary}
            </p>
          </div>

          {/* Defenses list */}
          {effectiveDeed.caseFacts.defensesPresented?.length > 0 && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-300">
                الدفوع المثارة أثناء جلسات المحاكمة:
              </h4>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {effectiveDeed.caseFacts.defensesPresented.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Parties & Deed Meta (أطراف الدعوى وبيانات الصك) */}
      {activeDeedTab === 'deed_meta' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plaintiffs */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>المدعي / المستأنف ضده:</span>
              </h4>
              {effectiveDeed.parties.plaintiffs.map((p, i) => (
                <div key={i} className="text-xs text-slate-200">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-[11px] text-slate-400">الهوية/السجل: {p.idNumber || '[مدون بالصك]'}</p>
                </div>
              ))}
            </div>

            {/* Defendants */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>المدعى عليه / المستأنف:</span>
              </h4>
              {effectiveDeed.parties.defendants.map((d, i) => (
                <div key={i} className="text-xs text-slate-200">
                  <p className="font-bold">{d.name}</p>
                  <p className="text-[11px] text-slate-400">الهوية/السجل: {d.idNumber || '[مدون بالصك]'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
