import React, { useState, useRef } from 'react';
import {
  FileUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Gavel,
  Scale,
  X,
  FileCheck2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface PdfJudgmentUploadCardProps {
  onAnalyzePdf: (payload: {
    fileBase64?: string;
    documentText?: string;
    documentType: string;
    fileName: string;
    mimeType: string;
    caseFocus: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const PdfJudgmentUploadCard: React.FC<PdfJudgmentUploadCardProps> = ({
  onAnalyzePdf,
  isLoading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleDeedText = `المملكة العربية السعودية
وزارة العدل - المجلس الأعلى للقضاء
المحكمة التجارية بالرياض - الدائرة التجارية الخامسة
صك حكم رقم: (44298104) وتاريخ 14/06/1445هـ
رقم القضية الأساسية: (7120/1445هـ)

الحمد لله وحده والصلاة والسلام على من لا نبي بعده، وبعد:
ففي يوم الأربعاء 14/06/1445هـ، عقدت الدائرة التجارية الخامسة بالمحكمة التجارية بالرياض جلستها القضائية، بتشكيلها المكون من:
فضيلة القاضي/ عبد العزيز بن فهد آل الشيخ (رئيساً)، وعضوية القاضيين/ تركي العتيبي وسلمان الدوسري، وبحضور أمين السر/ ماجد المطيري.
للنظر في الدعوى المقيدة برقم (7120) لعام 1445هـ، والمقامة من:
المدعي: شركة الوفاق للتوريدات والمقاولات (سجل تجاري رقم 1010876543)، يمثلها وكيلها المحامي/ أحمد السالم (بموجب وكالة شرعية رقم 441098).
ضد:
المدعى عليه: مؤسسة أفق البناء للتطوير العقاري (سجل تجاري رقم 1010321987)، يمثلها المدير/ خالد بن سعد القحطاني (سعودي الجنسية، هوية رقم 1087654321).

[أولاً: وقائع الدعوى والدفوع]:
تتحصل وقائع هذه الدعوى بالقدر اللازم لإصدار هذا الصك في تقدم وكيل المدعية بلائحة دعوى يذكر فيها: "أنه بتاريخ 10/01/1444هـ تعاقدت موكلته مع المدعى عليها لتوريد مواد بناء وحديد تسليح لمشروع سكني بقيمة إجمالية قدرها (1,850,000) ريال، وقد قامت موكلته بإنجاز التوريدات وفق أذونات التسليم المرفقة بالأوراق ومطابقة للمواصفات، وسددت المدعى عليها دفعة أولى قدرها (850,000) ريال وامتنعت عن سداد المتبقي البالغ قدره (1,000,000) ريال رغم المطالبات المتكررة ومضي أكثر من ستة أشهر على الاستحقاق، ويطلب إلزام المدعى عليها بدفع المتبقي وقدره مليون ريال وأتعاب المحاماة".

وبسؤال المدعى عليه أصالة أجاب بما نصه: "ما ذكرته المدعية من أصل التعاقد صحيح، غير أن التوريدات شابتها عيوب جوهرية ولم تكن متطابقة مع شهادات الفحص المعتمدة، ونتج عن ذلك توقف أعمال الصب بالمشروع، ونتمسك بالدفع بالقصور في التنفيذ، وطلبنا فسخ العقد ونفي استحقاق المدعية لكامل المبلغ، كما ندفع بعدم حجية مراسلات البريد الإلكتروني العادية دون توثيق تقني وفق نظام الإثبات".

وقدمت المدعية أذونات تسليم ممهورة بختم استلام المستودع التابع للمدعى عليها، وفواتير ضريبية صادرة ومطابقة.

[ثانياً: أسباب وتسبيب الحكم]:
1. حيث إن النزاع ناشئ بين تاجرين وعن أعمال تجارية بالتبعية، فإن الدائرة مختصة ولائياً ونوعياً بنظر الدعوى طبقاً للمادة (16) من نظام المحاكم التجارية.
2. وحيث قدمت المدعية أذونات استلام موقعة ومختومة من التابعين للمدعى عليها تفيد تسلم كامل كميات الحديد محل العقد دون إبداء تحفظ عند الاستلام.
3. وحيث تنص المادة (29) من نظام الإثبات على أن: "المحرر العادي يعد صادراً ممن وقعه ما لم ينكر صراحة ما هو منسوب إليه من خط أو إمضاء أو ختم أو بصمة"، وحيث أقرت المدعى عليها بالتعاقد وختم مستودعها.
4. وحيث إن الدفع بوجود عيوب في التوريد جاء مرسلاً ومجرداً دون تقديم تقرير هندسي معتمد يثبت عدم المطابقة في حينه، مما يتعين معه التفات الدائرة عن هذا الدفع.
5. وحيث استقر القضاء التجاري على إلزام المدين بالوفاء متى ما ثبت تسليم المبيع للمشتري دون نزاع في التسليم.
6. وعن طلب أتعاب المحاماة، فحيث ألجأت المدعى عليها المدعية للترافع والمطالبة القضائية بغير وجه حق، فتقدر الدائرة أتعاب الترافع بمبلغ (50,000) ريال عملاً بالمادة (164) من اللائحة التنفيذية لنظام المحاكم التجارية.

[ثالثاً: منطوق الحكم القضائي]:
حكمت الدائرة بالآتي:
أولاً: إلزام المدعى عليها/ مؤسسة أفق البناء للتطوير العقاري (سجل تجاري 1010321987) بأن تدفع للمدعية/ شركة الوفاق للتوريدات والمقاولات مبلغاً وقدره (1,000,000) مليون ريال سعودي.
ثانياً: إلزام المدعى عليها بدفع مبلغ وقدره (50,000) خمسون ألف ريال سعودي أتعاباً للمحاماة.
ثالثاً: رد ما عدا ذلك من طلبات.

[مدد الاعتراض بالاستئناف]:
أفهمت الدائرة الحاضرين بأن هذا الحكم ابتدائي، وأن الميعاد النظامي للاعتراض بطلب الاستئناف هو (30) ثلاثون يوماً تبدأ من اليوم التالي لتسليم صورة صك الحكم عبر بوابة ناجز القضائية، وإذا انقضت المدة دون تقديم لائحة الاعتراض سقط الحق في الاستئناف واكتسب الحكم الصفة القطعية طبقاً للمادة (187) من نظام المرافعات الشرعية والمادة (79) من نظام المحاكم التجارية. وبذلك رفعت الجلسة.`;

  const handleFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      alert('الحد الأقصى لحجم ملف صك الحكم هو 50 ميغابايت');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSampleDeed = () => {
    // Load realistic Saudi Commercial Court Judgment
    setSelectedFile(null);
    setFileBase64(null);
    simulateUploadAndAnalyze({
      documentText: sampleDeedText,
      documentType: 'صك حكم قضائي (المحكمة التجارية)',
      fileName: 'صك_حكم_المحكمة_التجارية_بالرياض_44298104.pdf',
      mimeType: 'application/pdf',
      caseFocus: 'تحليل صك الحكم وتفنيد التسبيب والمنطوق وحساب مدد الاستئناف',
    });
  };

  const simulateUploadAndAnalyze = async (payload: {
    fileBase64?: string;
    documentText?: string;
    documentType: string;
    fileName: string;
    mimeType: string;
    caseFocus: string;
  }) => {
    // Multi-stage progress simulation
    setProgressPercent(15);
    setProgressStage('جارٍ رفع وقراءة مستند صك الحكم (PDF/OCR)...');

    const t1 = setTimeout(() => {
      setProgressPercent(45);
      setProgressStage('المسح الضوئي واستخراج نصوص الدائرة القضائية والأطراف...');
    }, 600);

    const t2 = setTimeout(() => {
      setProgressPercent(75);
      setProgressStage('تفنيد أسباب وتسبيب الحكم وكشف الثغرات النظامية...');
    }, 1200);

    const t3 = setTimeout(() => {
      setProgressPercent(90);
      setProgressStage('استخراج منطوق الحكم واحتساب الموعد النهائي للاستئناف...');
    }, 2000);

    try {
      await onAnalyzePdf(payload);
      setProgressPercent(100);
      setProgressStage('اكتمل التحليل القضائي لصك الحكم بنجاح.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setTimeout(() => {
        setProgressPercent(0);
        setProgressStage('');
      }, 1500);
    }
  };

  const handleStartUpload = () => {
    if (!fileBase64 && !selectedFile) {
      alert('يرجى اختيار ملف PDF لصك الحكم أولاً');
      return;
    }

    simulateUploadAndAnalyze({
      fileBase64: fileBase64 || undefined,
      documentType: 'صك حكم قضائي ومحضر جلسة',
      fileName: selectedFile?.name || 'صك_حكم_قضائي.pdf',
      mimeType: selectedFile?.type || 'application/pdf',
      caseFocus: 'استخراج الدائرة والمنطوق والتسبيب ومدد الاعتراض بالاستئناف',
    });
  };

  return (
    <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 sm:p-7 shadow-xl space-y-5 relative overflow-hidden">
      {/* Decorative emerald gradient */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-emerald-700 flex items-center justify-center text-white shadow-md">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>رفع صك الحكم القضائي (PDF Scanner & OCR)</span>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  حتى 50 ميغابايت
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                يدعم ملفات صكوك الأحكام الممسوحة ضوئياً والمطبوعة عبر بوابة ناجز والمحاكم السعودية
              </p>
            </div>
          </div>

          {/* Quick Sample Button */}
          <button
            type="button"
            onClick={handleSelectSampleDeed}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-emerald-950/60 text-emerald-300 border border-slate-700 hover:border-emerald-600/50 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تجربة صك حكم تجاري نموذجي بنقرة واحدة</span>
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-950/20 scale-[0.99]'
              : 'border-slate-700 hover:border-slate-600 bg-slate-950/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          {!selectedFile ? (
            <div className="space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center shadow-inner">
                <FileUp className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">
                  اسحب وأفلت ملف صك الحكم (PDF) هنا، أو اضغط للاستعراض
                </p>
                <p className="text-xs text-slate-400">
                  يدعم صكوك المحاكم التجارية، الجزائية، العامة، العمالية، والأحوال الشخصية الممسوحة ضوئياً
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 shadow-sm transition-colors inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>اختيار ملف صك الحكم من جهازك</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right max-w-xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800/50 text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-xs font-bold text-slate-100 truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} ميغابايت • جاهز للمعالجة والاستخراج الآلي
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setFileBase64(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="إلغاء الملف"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar (Visible during processing) */}
        {(isLoading || progressPercent > 0) && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-300 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span>{progressStage || 'جارٍ معالجة صك الحكم بالذكاء العدلي...'}</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {progressPercent || 65}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent || 65}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>1. رفع ملف PDF ومسح OCR</span>
              <span>2. تحديد الدائرة والأطراف</span>
              <span>3. تفنيد التسبيب والمنطوق</span>
              <span>4. احتساب مهلة الاستئناف</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {selectedFile && !isLoading && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleStartUpload}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-amber-700 hover:from-emerald-500 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>بدء التحليل والتفنيد القضائي لصك الحكم</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
