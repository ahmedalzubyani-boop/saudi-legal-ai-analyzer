import React from 'react';
import {
  ShieldAlert,
  Clock,
  Search,
  Scale,
  AlertOctagon,
  CheckCircle2,
  FileWarning,
  Building2,
  MapPin
} from 'lucide-react';
import { ArrestDetails, ProceduralLegality } from '../types/legal';

interface ProceduralLegalitySectionProps {
  proceduralLegality: ProceduralLegality;
  arrestDetails?: ArrestDetails;
}

export const ProceduralLegalitySection: React.FC<ProceduralLegalitySectionProps> = ({
  proceduralLegality,
  arrestDetails,
}) => {
  const violations = proceduralLegality.proceduralViolations || [];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <span>فحص مشروعية إجراءات الضبط الجنائي والتوقيف (نظام الإجراءات الجزائية)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تكييف إجراءات القبض والتفتيش وحرمة المساكن ومدد الحبس الاحتياطي وفق نظام الإجراءات الجزائية ولائحته
          </p>
        </div>

        {violations.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-bold">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>تم رصد ({violations.length}) عيوب إجرائية تستوجب البطلان</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>الإجراءات الظاهرة متوافقة أولياً مع النظام</span>
          </span>
        )}
      </div>

      {/* Arrest Metadata Cards */}
      {arrestDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>الجهة الضابطة:</span>
            </span>
            <p className="text-xs font-bold text-slate-200">
              {arrestDetails.authority || '[لم يرد في أوراق الضبط]'}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>تاريخ وساعة الضبط:</span>
            </span>
            <p className="text-xs font-bold text-slate-200 font-mono">
              {arrestDetails.dateTime || '[لم يرد في أوراق الضبط]'}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>مكان وظروف الواقعة:</span>
            </span>
            <p className="text-xs font-bold text-slate-200 truncate" title={arrestDetails.location}>
              {arrestDetails.location || '[لم يرد في أوراق الضبط]'}
            </p>
          </div>
        </div>
      )}

      {/* Grid of Main Legal Analysis Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arrest & Search Validity */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-100">
                مشروعية الاستيقاف والتفتيش (المواد 30، 35، 40، 41)
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {proceduralLegality.arrestLegality}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/70 text-[11px] text-slate-400">
            السند: المادة (30) لحالات التلبس، والمادة (40 و41) لحرمة الأشخاص والمساكن والمراكب.
          </div>
        </div>

        {/* Detention & Custody Limits (24 Hours rule) */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  مدد التوقيف والحبس الاحتياطي (المادة 35، 113، 114)
                </h4>
              </div>
              {proceduralLegality.isDetentionExceeded && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  تجاوز المدة النظامية!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {proceduralLegality.detentionPeriods}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/70 text-[11px] text-amber-300/80">
            القاعدة النظامية: لا يجوز بقاء المتهم لدى الضبط الجنائي أكثر من (24) ساعة قبل رفعه للمحقق (م 35).
          </div>
        </div>
      </div>

      {/* Defendant Rights Observed */}
      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
        <h4 className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
          <span>ضمانات المتهم والحياد (المادة 2 والمادة 4 والمادة 102):</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          {proceduralLegality.rightsObserved ||
            'لم يثبت تمكين المتهم من الاستعانة بمحامٍ أثناء الاستجواب الأولي، كما دفع بانتفاء الإرادة الحرة.'}
        </p>
      </div>

      {/* Procedural Violations Table */}
      {violations.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
            <FileWarning className="w-4 h-4 text-rose-400" />
            <span>تفصيل البطلانات والعيوب الإجرائية المرصودة في أوراق الضبط:</span>
          </h4>

          <div className="space-y-2">
            {violations.map((viol, index) => (
              <div
                key={index}
                className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                    <span className="text-xs font-bold text-slate-100">
                      {viol.violation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 pr-4">
                    الأثر القضائي: {viol.legalImpact}
                  </p>
                </div>

                <div className="shrink-0 self-start sm:self-auto">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 text-amber-300 border border-slate-800">
                    {viol.articleReference}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
