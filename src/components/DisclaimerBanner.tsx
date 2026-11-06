import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  customText?: string;
  isCompact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  customText,
  isCompact = false,
}) => {
  const defaultText =
    'تنبيه نظامي وإخلاء مسؤولية: هذا التحليل مخصص لأغراض الدراسة والبحث والمساندة الفنية في القضايا، ولا يحل بأي حال من الأحوال محل التوكيل النظامي أو الاستشارة من محامٍ مرخص من وزارة العدل بالمملكة العربية السعودية، أو القرار القضائي الصادر عن المحاكم المختصة أو أوامر النيابة العامة. كما يلتزم المحلل بالوقائع الواردة في الأوراق دون اختلاق أو تأويل مالم تدعمه بينة.';

  if (isCompact) {
    return (
      <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5 flex items-start gap-2.5 text-xs text-amber-200/90">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{customText || defaultText}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-emerald-950/40 border border-amber-800/40 rounded-xl p-4 my-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-300">
            ضوابط الحياد والأمان العدلي وإخلاء المسؤولية
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {customText || defaultText}
          </p>
          <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
            <span>• معايير عدم الهلوسة: الاعتماد الحصري على نصوص المحاضر</span>
            <span>• النصوص غير المقروءة تدوّن بـ: [النص غير مقروء في الوثيقة الأصلية]</span>
          </div>
        </div>
      </div>
    </div>
  );
};
