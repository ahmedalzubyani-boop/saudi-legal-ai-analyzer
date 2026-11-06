import React from 'react';
import { GitCompare, AlertTriangle, ArrowLeftRight, Check, UserCheck } from 'lucide-react';
import { TestimonyComparison } from '../types/legal';

interface TestimonyComparisonTableProps {
  comparisons?: TestimonyComparison[];
}

export const TestimonyComparisonTable: React.FC<TestimonyComparisonTableProps> = ({
  comparisons,
}) => {
  if (!comparisons || comparisons.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center text-slate-400 text-xs">
        لم يتم رصد أقوال متعددة لمقارنتها في هذه الوثيقة
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-amber-400" />
            <span>مصفوفة تسلسل ومقارنة الأقوال (الشرطة ↔ النيابة ↔ المحكمة)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تتبع تطور أقوال الأطراف ورصد التناقضات والرجوع عن الإقرارات وادعاءات الإكراه
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          عدد الأطراف المقارنة: {comparisons.length}
        </span>
      </div>

      <div className="space-y-4">
        {comparisons.map((item, index) => (
          <div
            key={index}
            className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Header of Party */}
            <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>أقوال: {item.partyName}</span>
              </span>

              {item.claimsOfCoercion && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>دفع بالإكراه / رجوع عن الإقرار</span>
                </span>
              )}
            </div>

            {/* Stages Grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Police Station */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3">
                <span className="text-[11px] font-bold text-indigo-400 block mb-1">
                  1. محضر الضبط الجنائي (الشرطة):
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.policeStatement || '[لم يدون أقوالاً بالشرطة أو ممتنع]'}
                </p>
              </div>

              {/* Public Prosecution */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3">
                <span className="text-[11px] font-bold text-emerald-400 block mb-1">
                  2. تحقيقات النيابة العامة:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.prosecutionStatement || '[لم تُرفق أقوال النيابة بالوثيقة]'}
                </p>
              </div>

              {/* Court Trial */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3">
                <span className="text-[11px] font-bold text-amber-400 block mb-1">
                  3. أمام مجلس القضاء (المحكمة):
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.courtStatement || '[لم تنعقد جلسة المحكمة بعد أو غير مذكور]'}
                </p>
              </div>
            </div>

            {/* Discrepancies and Judicial Impact */}
            <div className="px-4 py-3 bg-amber-950/15 border-t border-slate-800/80 text-xs text-slate-300 space-y-1">
              <div className="flex items-start gap-2">
                <GitCompare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">
                    رصد التناقض والتباين الإجرائي:
                  </span>{' '}
                  <span className="text-slate-200">{item.discrepancies}</span>
                </div>
              </div>

              {item.claimsOfCoercion && (
                <div className="text-[11px] text-rose-300/90 pt-1 pr-6">
                  <span className="font-semibold text-rose-400">سند الإكراه أو الرجوع:</span>{' '}
                  {item.claimsOfCoercion}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
