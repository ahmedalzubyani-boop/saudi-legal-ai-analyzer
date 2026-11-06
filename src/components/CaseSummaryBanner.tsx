import React from 'react';
import { FileText, Gavel, Calendar, Hash, Building2, AlertTriangle, CheckSquare } from 'lucide-react';
import { DeedVerdict } from '../types/legal';

interface CaseSummaryBannerProps {
  summary: string;
  caseNumber?: string;
  caseDate?: string;
  jurisdiction?: string;
  deedVerdict?: DeedVerdict;
  unclearOrMissing?: string[];
}

export const CaseSummaryBanner: React.FC<CaseSummaryBannerProps> = ({
  summary,
  caseNumber,
  caseDate,
  jurisdiction,
  deedVerdict,
  unclearOrMissing,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {caseNumber && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Hash className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">رقم القضية / المحضر:</span>
              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                {caseNumber}
              </span>
            </div>
          )}

          {caseDate && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">التاريخ:</span>
              <span className="font-mono font-bold text-white">{caseDate}</span>
            </div>
          )}

          {jurisdiction && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">الجهة / الدائرة:</span>
              <span className="font-semibold text-slate-200">{jurisdiction}</span>
            </div>
          )}
        </div>

        <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 text-[11px] font-semibold">
          تحليل نظامي مكتمل
        </span>
      </div>

      {/* Summary Narrative */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>ملخص واقعة الضبط والدعوى القضائية:</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {summary}
        </p>
      </div>

      {/* Court Deed Verdict (if doc is a court verdict) */}
      {deedVerdict && deedVerdict.verdictText && (
        <div className="bg-gradient-to-r from-amber-950/30 via-slate-950/80 to-emerald-950/30 border border-amber-600/30 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>منطوق صك الحكم القضائي الصادر:</span>
            </span>
            {deedVerdict.legalStatus && (
              <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {deedVerdict.legalStatus}
              </span>
            )}
          </div>

          <div className="bg-slate-950/90 p-3 rounded-lg border border-slate-800 text-xs sm:text-sm text-amber-100 font-semibold leading-relaxed font-sans">
            {deedVerdict.verdictText}
          </div>

          {deedVerdict.judicialGrounds && deedVerdict.judicialGrounds.length > 0 && (
            <div className="space-y-1 text-xs text-slate-300">
              <span className="font-bold text-slate-400 block text-[11px]">
                أهم حيثيات وأسباب تسبيب الحكم:
              </span>
              <ul className="list-disc list-inside space-y-1 pr-1 text-[11px] text-slate-300">
                {deedVerdict.judicialGrounds.map((g, idx) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Unclear or Missing Elements Alerts */}
      {unclearOrMissing && unclearOrMissing.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>تنبيهات النصوص غير المقروءة أو البيانات الغائبة عن أوراق الضبط:</span>
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {unclearOrMissing.map((item, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-md"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
