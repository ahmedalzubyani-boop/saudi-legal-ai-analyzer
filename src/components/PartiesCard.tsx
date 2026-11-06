import React from 'react';
import { Users, User, Shield, Briefcase, FileText, BadgeAlert } from 'lucide-react';
import { Party } from '../types/legal';

interface PartiesCardProps {
  parties: Party[];
}

export const PartiesCard: React.FC<PartiesCardProps> = ({ parties }) => {
  if (!parties || parties.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center text-slate-400 text-xs">
        لم يتم رصد أطراف محددين في الوثيقة
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    if (role.includes('متهم') || role.includes('مدعى عليه')) {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
    if (role.includes('مجني عليه') || role.includes('شاكي')) {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    }
    if (role.includes('مدعي عام') || role.includes('محقق') || role.includes('نيابة')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
    if (role.includes('ضبط') || role.includes('شرطة') || role.includes('دورية')) {
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
    if (role.includes('شاهد')) {
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    }
    return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>الأطراف والكيانات القضائية المقيدة بالدعوى ({parties.length})</span>
        </h3>
        <span className="text-[11px] text-slate-400">
          استخراج وتصنيف الأطراف طبقاً لمحاضر الضبط
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {parties.map((party, idx) => (
          <div
            key={idx}
            className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3.5 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getRoleBadge(
                    party.role
                  )}`}
                >
                  {party.role}
                </span>
                {party.nationality && (
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    {party.nationality}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{party.name || '[الاسم غير مقروء في الوثيقة]'}</span>
              </h4>

              <div className="mt-2 space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Shield className="w-3 h-3 text-slate-500" />
                  <span>الهوية / الإقامة:</span>
                  <span className="text-slate-200 font-mono">
                    {party.idNumber || '[لم يرد في أوراق الضبط]'}
                  </span>
                </div>

                {party.job && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Briefcase className="w-3 h-3 text-slate-500" />
                    <span>المهنة / العمل:</span>
                    <span className="text-slate-200">{party.job}</span>
                  </div>
                )}
              </div>
            </div>

            {party.statementsSummary && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 leading-relaxed bg-slate-900/40 p-2 rounded-lg">
                <span className="font-semibold text-emerald-400 block mb-0.5">
                  خلاصة الأقوال المقيدة:
                </span>
                {party.statementsSummary}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
