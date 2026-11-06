import React from 'react';
import { Scale, BookOpen, FileText, MessageSquare, Printer, RotateCcw, HeartHandshake } from 'lucide-react';

interface HeaderProps {
  onOpenStatutes: () => void;
  onOpenMemorandum: () => void;
  onOpenDefendantAppeal?: () => void;
  onReset: () => void;
  onOpenChat?: () => void;
  hasAnalysis: boolean;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStatutes,
  onOpenMemorandum,
  onOpenDefendantAppeal,
  onReset,
  onOpenChat,
  hasAnalysis,
  onPrint,
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-emerald-900/40 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-800 to-amber-700 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/80 rounded-[10px] flex items-center justify-center text-amber-400">
              <Scale className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>المستشار والمحلل العدلي الذكي</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-normal">
                  الأنظمة السعودية
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              فحص محاضر الضبط الجنائي وتحقيقات النيابة وصكوك المحاكم طبقاً لنظام الإجراءات الجزائية ونظام الإثبات
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 transition-colors shadow-sm"
              title="محادثة قضائية تفاعلية متعددة الجولات"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
              <span>المحادثة والاستشارة المباشرة</span>
            </button>
          )}

          {onOpenDefendantAppeal && (
            <button
              onClick={onOpenDefendantAppeal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md shadow-amber-950/40 border border-amber-400/40 transition-all"
              title="توليد لائحة اعتراضية استئنافية ومساندة أهل المدعى عليه"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-amber-200" />
              <span>لائحة الاعتراض للمدعى عليه (ناجز)</span>
            </button>
          )}

          <button
            onClick={onOpenStatutes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors shadow-sm"
            title="تصفح مواد الأنظمة العدلية المعتمدة"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>مستعرض المواد النظامية</span>
          </button>

          {hasAnalysis && (
            <>
              <button
                onClick={onOpenMemorandum}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white border border-emerald-500/30 shadow-md shadow-emerald-950/40 transition-all"
                title="صياغة مذكرة جوابية أو دفوع للدائرة القضائية"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>صياغة مذكرة قضائية</span>
              </button>

              <button
                onClick={onPrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="طباعة تقرير التحليل"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>طباعة</span>
              </button>

              <button
                onClick={onReset}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="تحليل قضية جديدة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>جديد</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
