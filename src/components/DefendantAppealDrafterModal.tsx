import React, { useState } from 'react';
import {
  FileText,
  X,
  Sparkles,
  Printer,
  Copy,
  CheckCircle2,
  Scale,
  Gavel,
  Clock,
  Edit3,
  AlertTriangle,
  Download,
  HeartHandshake,
  ShieldCheck,
  CheckSquare,
  Square,
  Share2
} from 'lucide-react';
import { DetailedDeedAnalysis, AnalysisResult } from '../types/legal';

interface DefendantAppealDrafterModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult | null;
  deed?: DetailedDeedAnalysis | null;
}

export const DefendantAppealDrafterModal: React.FC<DefendantAppealDrafterModalProps> = ({
  isOpen,
  onClose,
  analysis,
  deed,
}) => {
  // Appellant identification
  const [appellantName, setAppellantName] = useState(
    deed?.parties?.defendants?.[0]?.name ||
      analysis?.parties?.find((p) => p.role.includes('متهم') || p.role.includes('مدعى عليه'))?.name ||
      'المحكوم ضده / المدعى عليه'
  );

  const [caseNumber, setCaseNumber] = useState(
    deed?.deedNumber || analysis?.caseNumber || 'المقيدة بالأوراق'
  );

  const [courtName, setCourtName] = useState(
    deed?.courtName || analysis?.jurisdiction || 'المحكمة الجزائية / العامة'
  );

  React.useEffect(() => {
    if (isOpen) {
      const detectedAppellant =
        deed?.parties?.defendants?.[0]?.name ||
        analysis?.parties?.find((p) => p.role.includes('متهم') || p.role.includes('مدعى عليه'))?.name;
      if (detectedAppellant) {
        setAppellantName(detectedAppellant);
      }
      const detectedCaseNo = deed?.deedNumber || analysis?.caseNumber;
      if (detectedCaseNo) {
        setCaseNumber(detectedCaseNo);
      }
      const detectedCourt = deed?.courtName || analysis?.jurisdiction;
      if (detectedCourt) {
        setCourtName(detectedCourt);
      }
    }
  }, [isOpen, deed, analysis]);

  // Judgment flaws selection
  const [flawReasoningInadequacy, setFlawReasoningInadequacy] = useState(true); // القصور في التسبيب
  const [flawCorruptDeduction, setFlawCorruptDeduction] = useState(true); // الفساد في الاستدلال
  const [flawEvidenceLawBreach, setFlawEvidenceLawBreach] = useState(true); // مخالفة نظام الإثبات
  const [flawIgnoredWitnesses, setFlawIgnoredWitnesses] = useState(true); // إغفال شهود النفي أو الفحص الفني
  const [flawProceduralNullity, setFlawProceduralNullity] = useState(true); // بطلان القبض والتفتيش وتجاوز 24 ساعة

  // Mitigating circumstances for family support
  const [mitigationCleanRecord, setMitigationCleanRecord] = useState(true); // خلو السوابق
  const [mitigationSoleBreadwinner, setMitigationSoleBreadwinner] = useState(true); // العائل الوحيد لأسرته ووالديه
  const [mitigationGoodConduct, setMitigationGoodConduct] = useState(true); // حسن السيرة والسلوك
  const [mitigationSuspensionRequest, setMitigationSuspensionRequest] = useState(true); // طلب وقف التنفيذ

  const [additionalFamilyNotes, setAdditionalFamilyNotes] = useState(
    'المحكوم ضده هو العائل الوحيد لوالديه المسنين وزوجته وأطفاله الصغار، وليس لديه أي سابقة جنائية طوال حياته، والواقعة شابتها شبهة قوية وكيدية.'
  );

  const [appealBriefText, setAppealBriefText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopiedForNajiz, setIsCopiedForNajiz] = useState(false);
  const [isWordDownloaded, setIsWordDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAppeal = async () => {
    setIsGenerating(true);
    try {
      const flaws = [
        flawReasoningInadequacy && 'القصور في التسبيب (عدم كفاية الأسباب التي بنى عليها القاضي قناعته)',
        flawCorruptDeduction && 'الفساد في الاستدلال (استنباط أدلة لا تؤدي للنتيجة وإغفال دفوع جوهرية قدمها المتهم)',
        flawEvidenceLawBreach && 'مخالفة مواد نظام الإثبات (شروط الإقرار القضائي، حجية الدليل الرقمي م 54)',
        flawIgnoredWitnesses && 'إغفال شهادات النفي وعدم مناقشة التقارير الفنية الجنائية بالأوراق',
        flawProceduralNullity && 'بطلان إجراءات القبض والتفتيش وتجاوز مدة الـ 24 ساعة للضبط الجنائي (نظام الإجراءات الجزائية م 30، 35، 40)',
      ].filter(Boolean);

      const mitigations = [
        mitigationCleanRecord && 'خلو صحيفة سوابق المتهم من أي سوابق جنائية سابقة نهائياً',
        mitigationSoleBreadwinner && 'كون المتهم العائل الوحيد والمنفق على أسرته وأطفاله ووالديه الطاعنين في السن',
        mitigationGoodConduct && 'حسن السيرة والسلوك والاستقامة المشهود بها له',
        mitigationSuspensionRequest && 'المطالبة بوقف تنفيذ العقوبة التعزيرية للمصلحة العامة ولحماية مستقبل أسرته',
      ].filter(Boolean);

      const payload = {
        detailedDeed: deed || {
          courtName,
          deedNumber: caseNumber,
          originalCaseNumber: caseNumber,
          circuitType: courtName.includes('تجارية') ? 'تجارية' : courtName.includes('جزائية') ? 'جزائية' : 'عامة',
          verdict: {
            pronouncedText: analysis?.deedVerdict?.verdictText || 'الحكم الصادر ضد المتهم',
            classification: 'إدانة أو إلزام',
          },
          reasoningAndGrounds: {
            reasoningDefects: flaws,
          },
          appealDeadline: {
            daysAllowed: 30,
            statutoryBasis: courtName.includes('جزائية') ? 'المادة (194) من نظام الإجراءات الجزائية' : 'المادة (187) من نظام المرافعات الشرعية',
          },
          appealStrategicPoints: flaws,
        },
        appellantRole: `المستأنف/ ${appellantName} (أصالة أو وكالة)`,
        focusDefects: `
[مواطن القصور المطلوب تفنيدها في الحكم]:
${flaws.map((f, i) => `${i + 1}. ${f}`).join('\n')}

[موجبات الرأفة والظروف المخففة ومساندة الأسرة]:
${mitigations.map((m, i) => `- ${m}`).join('\n')}
ملاحظات الأسرة: ${additionalFamilyNotes}
        `,
      };

      const response = await fetch('/api/generate-appeal-memorandum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success && data.appealMemorandum) {
        setAppealBriefText(data.appealMemorandum);
      } else {
        throw new Error(data.error || 'تعذر توليد اللائحة الاعتراضية');
      }
    } catch (err: any) {
      alert(`خطأ أثناء الصياغة: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyForNajiz = () => {
    if (!appealBriefText) return;
    // Format text cleanly without Markdown hashes so it pastes into Najiz perfectly
    const cleanText = appealBriefText
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*/g, '')
      .trim();

    navigator.clipboard.writeText(cleanText);
    setIsCopiedForNajiz(true);
    setTimeout(() => setIsCopiedForNajiz(false), 3000);
  };

  const handleDownloadWord = () => {
    if (!appealBriefText) return;

    const formattedContent = appealBriefText.replace(/\n/g, '<br/>');
    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>لائحة اعتراضية استئنافية - ${caseNumber}</title>
        <style>
          body {
            font-family: 'Arial', 'Cairo', sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 2.0;
            font-size: 14pt;
            color: #000000;
            margin: 2cm;
          }
          .title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .parties-box {
            border: 1px solid #333;
            padding: 12px;
            margin-bottom: 25px;
            background-color: #fcfcfc;
          }
          .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-top: 15px;
            font-size: 15pt;
          }
          .signature-area {
            margin-top: 50px;
            text-align: left;
          }
        </style>
      </head>
      <body dir='rtl'>
        <div class="title">بسم الله الرحمن الرحيم</div>
        <div class="parties-box">
          <strong>لدى أصحاب الفضيلة رئيس وأعضاء محكمة الاستئناف الموقرين</strong><br/>
          <strong>القضية رقم:</strong> ${caseNumber}<br/>
          <strong>المستأنف (المدعى عليه):</strong> ${appellantName}<br/>
          <strong>المحكمة المصدرة للحكم:</strong> ${courtName}<br/>
        </div>
        <div>
          ${formattedContent}
        </div>
        <div class="signature-area">
          <strong>والله يحفظكم ويرعاكم،،،</strong><br/>
          <strong>مقدمه:</strong> ${appellantName}<br/>
          <strong>التوقيع:</strong> .....................................
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `لائحة_اعتراضية_استئنافية_قضية_${caseNumber}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsWordDownloaded(true);
    setTimeout(() => setIsWordDownloaded(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-600/40 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-emerald-700 flex items-center justify-center text-white shadow-md">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>صياغة المذكرة الجوابية واللائحة الاعتراضية (مساندة أهل المدعى عليه)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                  مهيأة لبوابة ناجز
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                تفنيد مواطن القصور في التسبيب والفساد في الاستدلال وطلب البراءة أو الرأفة وتخفيف العقوبة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Guidance Alert Box */}
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-5 py-3 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>تنبيه إرشادي:</strong> هذه المذكرة مبنية على تحليل الذكاء الاصطناعي للمحاضر وصك الحكم لمساعدتكم في إعداد دفوعكم، ويُفضل تدقيقها قبل التقديم النهائي عبر منصة ناجز العدلية أو تقديمها للدائرة القضائية.
          </p>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: Defendant & Case Meta */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>بيانات الصك القضائي وأطراف الاستئناف:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">اسم المحكوم ضده (المستأنف):</label>
                <input
                  type="text"
                  value={appellantName}
                  onChange={(e) => setAppellantName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">رقم القضية / صك الحكم:</label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">المحكمة والدائرة المصدرة:</label>
                <input
                  type="text"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Analysis of Judgment Flaws (مواطن القصور في الحكم) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-rose-400" />
                <span>1. مواطن القصور في الحكم القضائي المطلوب تضمينها باللائحة:</span>
              </h3>
              <span className="text-[11px] text-slate-400">حدد الثغرات المنطبقة على أوراق قضيتكم</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-200">
              <label
                onClick={() => setFlawReasoningInadequacy(!flawReasoningInadequacy)}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition-colors"
              >
                <span className="mt-0.5 text-amber-400">
                  {flawReasoningInadequacy ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </span>
                <div>
                  <strong className="block text-slate-100 mb-0.5">القصور في التسبيب</strong>
                  <span className="text-slate-400 text-[11px]">عدم كفاية الأسباب التي بنى عليها القاضي قناعته وإغفال أسباب جوهرية</span>
                </div>
              </label>

              <label
                onClick={() => setFlawCorruptDeduction(!flawCorruptDeduction)}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition-colors"
              >
                <span className="mt-0.5 text-amber-400">
                  {flawCorruptDeduction ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </span>
                <div>
                  <strong className="block text-slate-100 mb-0.5">الفساد في الاستدلال</strong>
                  <span className="text-slate-400 text-[11px]">استنباط أدلة لا تؤدي للنتيجة، أو الاعتماد على إقرار مشوب بالإكراه</span>
                </div>
              </label>

              <label
                onClick={() => setFlawEvidenceLawBreach(!flawEvidenceLawBreach)}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition-colors"
              >
                <span className="mt-0.5 text-amber-400">
                  {flawEvidenceLawBreach ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </span>
                <div>
                  <strong className="block text-slate-100 mb-0.5">مخالفة نظام الإثبات</strong>
                  <span className="text-slate-400 text-[11px]">الطعن في حجية الإقرار غير القضائي، والمنازعة في شروط الدليل الرقمي (م 54)</span>
                </div>
              </label>

              <label
                onClick={() => setFlawIgnoredWitnesses(!flawIgnoredWitnesses)}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition-colors"
              >
                <span className="mt-0.5 text-amber-400">
                  {flawIgnoredWitnesses ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </span>
                <div>
                  <strong className="block text-slate-100 mb-0.5">إغفال شهود النفي والتقارير الفنية</strong>
                  <span className="text-slate-400 text-[11px]">عدم سماع بينات نفي التهمة أو إغفال نتائج فحص الأدلة الجنائية والطب الشرعي</span>
                </div>
              </label>

              <label
                onClick={() => setFlawProceduralNullity(!flawProceduralNullity)}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer select-none transition-colors md:col-span-2"
              >
                <span className="mt-0.5 text-amber-400">
                  {flawProceduralNullity ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </span>
                <div>
                  <strong className="block text-slate-100 mb-0.5">بطلان إجراءات القبض والتفتيش وتجاوز 24 ساعة (نظام الإجراءات الجزائية)</strong>
                  <span className="text-slate-400 text-[11px]">الدفع ببطلان ما بني على إجراء باطل وفق المواد (30، 35، 40، 41) وتجاوز مدد التوقيف</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Mitigating Circumstances & Family Support (موجبات الرأفة ومساندة الأسرة) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-emerald-300 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>2. موجبات التخفيف والرأفة ومساندة ظروف المتهم الأسرية:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
              <label
                onClick={() => setMitigationCleanRecord(!mitigationCleanRecord)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <span className="text-emerald-400">
                  {mitigationCleanRecord ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </span>
                <span>خلو صحيفة المتهم من السوابق الجنائية (سابقة أولى)</span>
              </label>

              <label
                onClick={() => setMitigationSoleBreadwinner(!mitigationSoleBreadwinner)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <span className="text-emerald-400">
                  {mitigationSoleBreadwinner ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </span>
                <span>العائل الوحيد لأسرته وأطفاله ووالديه المسنين</span>
              </label>

              <label
                onClick={() => setMitigationGoodConduct(!mitigationGoodConduct)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <span className="text-emerald-400">
                  {mitigationGoodConduct ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </span>
                <span>حسن السيرة والسلوك والاستقامة</span>
              </label>

              <label
                onClick={() => setMitigationSuspensionRequest(!mitigationSuspensionRequest)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <span className="text-emerald-400">
                  {mitigationSuspensionRequest ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                </span>
                <span>طلب وقف تنفيذ العقوبة للمصلحة الأسرية والاجتماعية</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                تفاصيل إضافية عن ظروف المتهم وأسرته لتضمينها باللائحة:
              </label>
              <textarea
                rows={2}
                value={additionalFamilyNotes}
                onChange={(e) => setAdditionalFamilyNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="اكتب أي ظروف خاصة (مرض، رعاية والدين، أطفال صغار، صغر سن، إلخ)..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleGenerateAppeal}
                disabled={isGenerating}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-700 hover:from-amber-500 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-950 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جارٍ صياغة وتأصيل اللائحة الاعتراضية الاستئنافية...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>توليد لائحة الاعتراض للمدعى عليه</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 4: Generated Brief & Export Tools */}
          {appealBriefText ? (
            <div className="space-y-3.5 pt-2 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <span>اللائحة الاعتراضية الاستئنافية الجاهزة (قابلة للتعديل والنسخ):</span>
                </span>

                {/* Export Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Button 1: Copy for Najiz */}
                  <button
                    type="button"
                    onClick={handleCopyForNajiz}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-950 transition-all"
                    title="نسخ النص مهيأ للصق المباشر في خانة الاستئناف ببوابة ناجز"
                  >
                    {isCopiedForNajiz ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>تم النسخ لمنصة ناجز!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ النص لمنصة ناجز</span>
                      </>
                    )}
                  </button>

                  {/* Button 2: Export as Word */}
                  <button
                    type="button"
                    onClick={handleDownloadWord}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold shadow-md transition-all"
                    title="تصدير كملف Word بتنسيق Microsoft Word رسمي جاهز للطباعة والتوقيع"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isWordDownloaded ? 'تم التحميل (Word)!' : 'تصدير كملف Word'}</span>
                  </button>

                  {/* Button 3: Print / PDF */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                    title="طباعة أو تصدير بصيغة PDF"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>تصدير PDF / طباعة</span>
                  </button>
                </div>
              </div>

              {/* Court Document Sheet with Authentic Judiciary Typography */}
              <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-inner">
                <textarea
                  rows={20}
                  value={appealBriefText}
                  onChange={(e) => setAppealBriefText(e.target.value)}
                  className="w-full bg-transparent text-slate-100 text-xs sm:text-sm font-sans leading-relaxed focus:outline-none resize-y border-none"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-slate-400 space-y-2">
              <HeartHandshake className="w-8 h-8 mx-auto text-amber-500/70" />
              <p className="text-xs font-medium">
                حدد مواطن القصور في الحكم وموجبات الرأفة أعلاه، ثم اضغط على زر "توليد لائحة الاعتراض للمدعى عليه"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
