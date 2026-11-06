import React from 'react';
import {
  FileCheck2,
  Package,
  Cpu,
  KeyRound,
  FileSearch,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  FileQuestion
} from 'lucide-react';
import { EvidenceEvaluation, PhysicalEvidence } from '../types/legal';

interface EvidenceEvaluationCardProps {
  evidenceEvaluation: EvidenceEvaluation;
  physicalEvidence?: PhysicalEvidence[];
}

export const EvidenceEvaluationCard: React.FC<EvidenceEvaluationCardProps> = ({
  evidenceEvaluation,
  physicalEvidence,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <span>تقييم حجية الأدلة والمضبوطات طبقاً لنظام الإثبات السعودي</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            فحص الإقرارات القضائية وغير القضائية، الأدلة الرقمية، شهادات الشهود، وسلسلة حيازة الأحراز (المرسوم الملكي م/43)
          </p>
        </div>
      </div>

      {/* Physical Evidence & Seizures (المضبوطات والأحراز) */}
      {physicalEvidence && physicalEvidence.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span>المضبوطات والأحراز والتقارير الفنية الملحقة:</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {physicalEvidence.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-100">
                    {item.description}
                  </span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                    حرز رقم {idx + 1}
                  </span>
                </div>

                {item.seizureMethod && (
                  <p className="text-[11px] text-slate-300">
                    <span className="text-slate-400">طريقة التحريز:</span> {item.seizureMethod}
                  </p>
                )}

                {item.forensicReport && (
                  <div className="text-[11px] bg-emerald-950/20 border border-emerald-800/30 p-2 rounded-lg text-emerald-300">
                    <span className="font-semibold block text-emerald-400 mb-0.5">
                      تقرير الفحص الفني / الأدلة الجنائية:
                    </span>
                    {item.forensicReport}
                  </div>
                )}

                {item.validityNotes && (
                  <p className="text-[11px] text-amber-300/80">
                    <span className="font-semibold">ملاحظة نظامية:</span> {item.validityNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Evaluation according to Saudi Evidence Law */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Confession Evaluation (الإقرار) */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-slate-100">
                حجية الإقرار وشروط صحته (المواد 14-20)
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {evidenceEvaluation.confessionAssessment ||
                'لم يرد إقرار قضائي صريح في الوثيقة أو تراجع المتهم عنه متمسكاً بانتفاء الإرادة الحرة.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            قاعدة نظامية: لا يتجزأ الإقرار على صاحبه (م 18)، ويشترط صدوره عن إرادة حرة واختيار (م 17).
          </div>
        </div>

        {/* Digital Evidence (الدليل الرقمي) */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-100">
                حجية الدليل الرقمي والتقني (المواد 53-64)
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {evidenceEvaluation.digitalEvidenceAssessment ||
                'لا تتضمن أوراق القضية منازعة في أدلة رقمية، أو تخلف التقرير الفني المعتمد لسلسلة البصمة الرقمية.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            المادة (54): يكون للدليل الرقمي حكم الإثبات بالكتابة متى استوفى الضوابط الفنية والأمنية المعتمدة.
          </div>
        </div>

        {/* Witnesses (شهادة الشهود) */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-slate-100">
                شهادة الشهود وضوابط الأهلية (المواد 65-80)
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {evidenceEvaluation.witnessAssessment ||
                'لم يتم الاستناد إلى شهادة شهود في واقعة الضبط، أو اقتصر الضبط على شهادة رجل الضبط الجنائي نفسه.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            المادة (65): تكون الشهادة عن معاينة ومشاهدة شخصية ولا تجوز بالتسامع في غير الأحوال النظامية.
          </div>
        </div>

        {/* Official & Customary Documents (المحررات الرسمية والعادية) */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-slate-100">
                حجية المحاضر والمحررات الرسمية (المواد 25-33)
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {evidenceEvaluation.officialDocumentsAssessment ||
                'المحاضر المحررة من رجال الضبط الجنائي حجة رسمية في حدود ما شاهده ودونه في حدود اختصاصه ما لم يثبت تزويرها أو بطلان الإجراء المنشئ لها.'}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            المادة (25): المحرر الرسمي حجة على الكافة بما دُوّن فيه من أمور قام بها محرره أو وقعت أمامه.
          </div>
        </div>
      </div>
    </div>
  );
};
