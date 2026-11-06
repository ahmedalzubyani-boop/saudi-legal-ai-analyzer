import React from 'react';
import { ShieldCheck, Scale, AlertCircle, Bookmark, CheckCircle2, Copy } from 'lucide-react';
import { ChargeAndStatute, DefenseStrategy } from '../types/legal';

interface ChargesAndDefensesCardProps {
  charges: ChargeAndStatute[];
  defenseStrategy: DefenseStrategy;
  onSelectDefenseForMemo?: (text: string) => void;
}

export const ChargesAndDefensesCard: React.FC<ChargesAndDefensesCardProps> = ({
  charges,
  defenseStrategy,
  onSelectDefenseForMemo,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formal = defenseStrategy?.formalDefenses || [];
  const substantive = defenseStrategy?.substantiveDefenses || [];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* 1. Charges and Statutory Basis */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <span>التهم المنسوبة وسندها في الأنظمة السعودية الموضوعية</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            التكييف الجرمي المقيد بأوراق النيابة وجهة الضبط
          </span>
        </div>

        {charges.length === 0 ? (
          <p className="text-xs text-slate-400">لم تقيد تهم واضحة في أوراق المستند.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {charges.map((c, i) => (
              <div
                key={i}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                    <span>{c.charge}</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {c.article}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1">
                  <p>
                    <span className="text-slate-400">النظام المطبق:</span>{' '}
                    <span className="font-semibold text-emerald-400">{c.statute}</span>
                  </p>
                  {c.penalty && (
                    <p className="text-slate-400">
                      <span className="text-slate-500">العقوبة المقررة نظاماً:</span> {c.penalty}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Formal Procedural Defenses (الدفوع الشكلية) */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>أولاً: الدفوع الشكلية الإجرائية المقترحة (نظام الإجراءات الجزائية)</span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium">
            تتعلق بالنظام العام وبطلان إجراءات الضبط
          </span>
        </div>

        {formal.length === 0 ? (
          <p className="text-xs text-slate-400">لم ترصد دفوع شكلية جوهرية من ظاهر الأوراق.</p>
        ) : (
          <div className="space-y-3">
            {formal.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-emerald-900/30 rounded-xl p-4 space-y-2 hover:border-emerald-800/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                    <span>الدفع: {item.defense}</span>
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                      {item.legalGround}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `الدفع بـ: ${item.defense}\nالسند النظامي: ${item.legalGround}\nالتطبيق والتسبيب: ${item.practicalApplication}`,
                          `formal-${idx}`
                        )
                      }
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="نسخ صيغة الدفع"
                    >
                      {copiedIndex === `formal-${idx}` ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="font-semibold text-slate-400 block mb-1">
                    التسبيب والتطبيق القضائي للدائرة:
                  </span>
                  {item.practicalApplication}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Substantive Defenses (الدفوع الموضوعية وتفنيد الأدلة) */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>ثانياً: الدفوع الموضوعية وتفنيد أدلة الاتهام (نظام الإثبات)</span>
          </h3>
          <span className="text-[11px] text-amber-400 font-medium">
            تتعلق بنفي الأركان وكفاية الأدلة والقصد الجنائي
          </span>
        </div>

        {substantive.length === 0 ? (
          <p className="text-xs text-slate-400">لم ترصد دفوع موضوعية إضافية.</p>
        ) : (
          <div className="space-y-3">
            {substantive.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-amber-900/30 rounded-xl p-4 space-y-2 hover:border-amber-800/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>الدفع: {item.defense}</span>
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {item.legalGround}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `الدفع بـ: ${item.defense}\nالسند النظامي: ${item.legalGround}\nالتطبيق والتسبيب: ${item.practicalApplication}`,
                          `sub-${idx}`
                        )
                      }
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="نسخ صيغة الدفع"
                    >
                      {copiedIndex === `sub-${idx}` ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="font-semibold text-slate-400 block mb-1">
                    التسبيب وتفنيد بينة المدعي العام:
                  </span>
                  {item.practicalApplication}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
