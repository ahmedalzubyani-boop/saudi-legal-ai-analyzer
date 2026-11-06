import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  X,
  FileCheck,
  Scale
} from 'lucide-react';
import { SAMPLE_CASES, SampleCase } from '../data/sampleCases';

interface CaseInputCardProps {
  onAnalyze: (payload: {
    documentText: string;
    documentType: string;
    imageBase64?: string;
    mimeType?: string;
    caseFocus: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const CaseInputCard: React.FC<CaseInputCardProps> = ({ onAnalyze, isLoading }) => {
  const [documentText, setDocumentText] = useState('');
  const [documentType, setDocumentType] = useState('محضر ضبط جنائي (الشرطة)');
  const [caseFocus, setCaseFocus] = useState('تحليل شامل وتفنيد الإجراءات والأقوال');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { id: 'police', label: 'محضر ضبط جنائي (الشرطة / مكافحة المخدرات)' },
    { id: 'prosecution', label: 'محضر تحقيقات النيابة العامة ولائحة الدعوى' },
    { id: 'court', label: 'صك حكم قضائي ومحضر جلسة محكمة' },
    { id: 'full', label: 'ملف قضية متكامل (ضبط + نيابة + محكمة)' },
  ];

  const focusOptions = [
    'تحليل شامل وتفنيد الإجراءات والأقوال',
    'فحص مشروعية القبض والتفتيش ومدد التوقيف',
    'مصفوفة مقارنة أقوال الأطراف ورصد التناقضات',
    'تقييم حجية الأدلة والاعترافات (نظام الإثبات)',
    'إعداد استراتيجية الدفوع الشكلية والموضوعية',
  ];

  const handleSelectSample = (sample: SampleCase) => {
    setDocumentText(sample.content);
    setDocumentType(sample.type);
    setImagePreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة واضحة لمحضر الضبط أو الوثيقة (PNG, JPG, WebP)');
      return;
    }

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setImageMimeType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentText.trim() && !imagePreview) {
      alert('يرجى إدخال نص المحضر أو إرفاق صورة ضوئية للوثيقة');
      return;
    }
    onAnalyze({
      documentText,
      documentType,
      imageBase64: imagePreview || undefined,
      mimeType: imageMimeType || undefined,
      caseFocus,
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl shadow-slate-950/40 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative z-10">
        {/* Title & Guidance */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <span>إدخال أوراق القضية ومحاضر الضبط للتحليل</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              أدخل نصوص المحاضر أو التقط صورة ضوئية للمستندات لفحصها نظامياً وفق الإجراءات الجزائية ونظام الإثبات
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">نماذج جاهزة:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SAMPLE_CASES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-700 hover:border-emerald-700/50 transition-colors"
                >
                  {sample.badge}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Document Type & Focus Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                نوع الوثيقة العدلية:
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {documentTypes.map((dt) => (
                  <option key={dt.id} value={dt.label}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                محور التركيز التحليلي:
              </label>
              <select
                value={caseFocus}
                onChange={(e) => setCaseFocus(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {focusOptions.map((f, i) => (
                  <option key={i} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Document Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>نص المحضر أو صك الجلسة:</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {documentText.length} حرف / حوالي {Math.round(documentText.split(/\s+/).filter(Boolean).length)} كلمة
              </span>
            </div>

            <textarea
              rows={8}
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="الصق هنا نص محضر الضبط الجنائي (الشرطة)، أو أقوال التحقيق بالنيابة العامة، أو وقائع ومنطوق صك الحكم... (مثال: محضر ضبط أمني، تاريخ الواقعة، أقوال المتهم، الأحراز والمضبوطات)..."
              className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-emerald-500 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors leading-relaxed font-sans"
            />
          </div>

          {/* Image / Scanned Document OCR Upload */}
          <div className="p-3.5 bg-slate-950/50 border border-dashed border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  إرفاق صورة ضوئية لمحضر الضبط أو صك الحكم (OCR Scanner)
                </p>
                <p className="text-[11px] text-slate-400">
                  يدعم صور المستندات الممسوحة ضوئياً ويقرأها مباشرة عبر ذكاء Gemini 3.8 Flash
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>رفع صورة المستند</span>
              </button>

              {imagePreview && (
                <div className="relative group flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/40 px-2 py-1 rounded-lg text-xs text-emerald-300">
                  <span className="truncate max-w-[120px]">صورة مرفقة</span>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="text-slate-400 hover:text-red-400"
                    title="حذف الصورة"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Image Thumbnail Preview */}
          {imagePreview && (
            <div className="relative p-2 bg-slate-950 rounded-xl border border-slate-800 inline-block max-w-xs">
              <img
                src={imagePreview}
                alt="Document Preview"
                className="max-h-40 rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-3 left-3 bg-red-600/90 text-white rounded-full p-1 hover:bg-red-700 transition-colors shadow-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>مطابق لأنظمة وزارة العدل والنيابة العامة بالمملكة العربية السعودية</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!documentText.trim() && !imagePreview)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-amber-700 hover:from-emerald-500 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 hover:shadow-emerald-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جارٍ الفحص والتحليل القضائي للنصوص...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>بدء التحليل القضائي والضبط الجنائي</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
