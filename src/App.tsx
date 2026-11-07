/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Scale,
  Shield,
  FileText,
  AlertTriangle,
  BookOpen,
  ArrowLeftRight,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Printer,
  Gavel,
  ShieldAlert,
  HelpCircle,
  Users,
  MessageSquare,
  X,
  RotateCcw,
  FileUp,
  Clock
} from 'lucide-react';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { CaseInputCard } from './components/CaseInputCard';
import { PdfJudgmentUploadCard } from './components/PdfJudgmentUploadCard';
import { DeedVerdictAnalysisDashboard } from './components/DeedVerdictAnalysisDashboard';
import { AppealBriefModal } from './components/AppealBriefModal';
import { DefendantAppealDrafterModal } from './components/DefendantAppealDrafterModal';
import { CaseSummaryBanner } from './components/CaseSummaryBanner';
import { PartiesCard } from './components/PartiesCard';
import { ProceduralLegalitySection } from './components/ProceduralLegalitySection';
import { TestimonyComparisonTable } from './components/TestimonyComparisonTable';
import { EvidenceEvaluationCard } from './components/EvidenceEvaluationCard';
import { ChargesAndDefensesCard } from './components/ChargesAndDefensesCard';
import { JudicialConsultantChat } from './components/JudicialConsultantChat';
import { MemorandumModal } from './components/MemorandumModal';
import { StatutesDrawer } from './components/StatutesDrawer';
import { AnalysisResult, DetailedDeedAnalysis } from './types/legal';
import { generateSaudiLegalAnalysisFallback } from './utils/fallbackLegalAnalyzer';

export default function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);

  // Home view mode: 'analyzer' | 'pdf_deed' | 'standalone_chat'
  const [viewMode, setViewMode] = useState<'analyzer' | 'pdf_deed' | 'standalone_chat'>('pdf_deed');

  const [activeTab, setActiveTab] = useState<
    'deed' | 'overview' | 'legality' | 'testimony' | 'evidence' | 'defenses' | 'consultant'
  >('deed');

  const [isMemorandumOpen, setIsMemorandumOpen] = useState(false);
  const [isStatutesOpen, setIsStatutesOpen] = useState(false);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [isDefendantAppealModalOpen, setIsDefendantAppealModalOpen] = useState(false);
  const [selectedDeedForAppeal, setSelectedDeedForAppeal] = useState<DetailedDeedAnalysis | null>(null);

  const handleAnalyze = async (payload: {
    documentText?: string;
    documentType: string;
    imageBase64?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
    caseFocus: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastPayload(payload);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        // If it's a deed, prioritize deed tab
        if (data.analysis.detailedDeed || data.analysis.deedVerdict) {
          setActiveTab('deed');
        } else {
          setActiveTab('overview');
        }
        return;
      } else {
        throw new Error(data.error || 'تعذر استكمال التحليل القضائي');
      }
    } catch (err: any) {
      console.warn('Backend /api/analyze unavailable or failed (e.g. GitHub Pages / static hosting), using in-browser Saudi legal analyzer:', err);
      // Automatic client-side fallback: Ensures the app never fails on GitHub Pages, Vercel payload limits, or quota spikes
      try {
        const textToAnalyze =
          payload.documentText ||
          (payload.fileName ? `صك حكم قضائي: ${payload.fileName}` : 'صك حكم قضائي');
        const fallbackAnalysis = generateSaudiLegalAnalysisFallback(
          textToAnalyze,
          payload.documentType || 'صك حكم قضائي',
          payload.caseFocus
        );
        if (fallbackAnalysis) {
          setAnalysis(fallbackAnalysis);
          if (fallbackAnalysis.detailedDeed || fallbackAnalysis.deedVerdict) {
            setActiveTab('deed');
          } else {
            setActiveTab('overview');
          }
          return;
        }
      } catch (fallbackErr) {
        console.error('Client fallback failed:', fallbackErr);
      }

      setErrorMessage(
        'تعذر الاتصال المباشر بالخادم أو حدث تأخر في الاستجابة. يمكنك الضغط على "إعادة المحاولة" لإعادة فحص الوثيقة.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastPayload) {
      handleAnalyze(lastPayload);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setErrorMessage(null);
    setActiveTab('deed');
    setViewMode('pdf_deed');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenAppealGenerator = (deed: DetailedDeedAnalysis) => {
    setSelectedDeedForAppeal(deed);
    setIsDefendantAppealModalOpen(true);
  };

  const isDeedPresent = !!(analysis?.detailedDeed || analysis?.deedVerdict);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-700 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenStatutes={() => setIsStatutesOpen(true)}
        onOpenMemorandum={() => setIsMemorandumOpen(true)}
        onOpenDefendantAppeal={() => setIsDefendantAppealModalOpen(true)}
        onReset={handleReset}
        onOpenChat={() => setViewMode(viewMode === 'standalone_chat' ? 'pdf_deed' : 'standalone_chat')}
        hasAnalysis={!!analysis}
        onPrint={handlePrint}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error notification banner with retry and dismiss */}
        {errorMessage && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-xs text-rose-200 flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-rose-300">
                  تنبيه أثناء معالجة الوثيقة العدلية:
                </span>
                <p className="leading-relaxed">{errorMessage}</p>
                {lastPayload && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white font-semibold transition-colors border border-rose-700/50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة المحاولة الفورية</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg text-rose-400 hover:text-white hover:bg-rose-900/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Home Mode Switcher (When no analysis is active) */}
        {!analysis && (
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setViewMode('pdf_deed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                viewMode === 'pdf_deed'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileUp className="w-4 h-4 text-amber-200" />
              <span>رفع صك الحكم القضائي (PDF/OCR)</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-300/40 px-1.5 py-0.2 rounded font-bold">
                جديد
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('analyzer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                viewMode === 'analyzer'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>فحص محاضر الضبط الجنائي والنيابة</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('standalone_chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                viewMode === 'standalone_chat'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>المستشار القضائي التفاعلي (Chatbot)</span>
            </button>
          </div>
        )}

        {/* 1. PDF Deed Upload View (Featured) */}
        {!analysis && viewMode === 'pdf_deed' && (
          <div className="space-y-6">
            <PdfJudgmentUploadCard onAnalyzePdf={handleAnalyze} isLoading={isLoading} />
            <DisclaimerBanner />
          </div>
        )}

        {/* 2. Standalone Chatbot View */}
        {!analysis && viewMode === 'standalone_chat' && (
          <div className="space-y-4">
            <JudicialConsultantChat analysis={analysis} />
            <DisclaimerBanner />
          </div>
        )}

        {/* 3. General Police & Investigation Report Ingestion View */}
        {!analysis && viewMode === 'analyzer' && (
          <div className="space-y-6">
            {/* Judicial Introduction Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>المحلل القضائي الذكي المعتمد للأنظمة العدلية بالمملكة</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    فحص وتفنيد محاضر الضبط الجنائي والنيابة العامة وصكوك المحاكم
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    منظومة ذكية مدربة على القواعد القضائية السعودية، تتولى استخراج الوقائع، وتقييم مشروعية إجراءات القبض والتفتيش وفق <span className="text-emerald-400 font-semibold">نظام الإجراءات الجزائية</span> (المواد 30، 35، 40، 113)، ومقارنة تطابق وتناقض الأقوال، وتقييم الأدلة والإقرارات الرقمية والمحررات طبقاً لـ <span className="text-amber-400 font-semibold">نظام الإثبات (المرسوم م/43)</span> مع صياغة مذكرات الدفوع القضائية الجاهزة.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>نظام الإجراءات الجزائية</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>نظام الإثبات الجديد</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>مكافحة المخدرات والمعلوماتية</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>صياغة المذكرات القضائية</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/80 border border-emerald-900/40 text-center max-w-[220px]">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-amber-400 mb-2">
                    <Gavel className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">الأمان والحياد العدلي</span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    عدم الهلوسة والالتزام الحصري بوقائع المحاضر المرفوعة
                  </span>
                </div>
              </div>
            </div>

            {/* Input Card */}
            <CaseInputCard onAnalyze={handleAnalyze} isLoading={isLoading} />
            <DisclaimerBanner />
          </div>
        )}

        {/* Structured Results Dashboard (when analysis is present) */}
        {analysis && (
          <div className="space-y-6">
            {/* Case Summary Top Banner */}
            <CaseSummaryBanner
              summary={analysis.caseSummary}
              caseNumber={analysis.caseNumber}
              caseDate={analysis.caseDate}
              jurisdiction={analysis.jurisdiction}
              deedVerdict={analysis.deedVerdict}
              unclearOrMissing={analysis.unclearOrMissingElements}
            />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 no-scrollbar">
              {isDeedPresent && (
                <button
                  type="button"
                  onClick={() => setActiveTab('deed')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'deed'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                      : 'text-amber-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Gavel className="w-4 h-4 text-amber-200" />
                  <span>تفنيد صك الحكم والاستئناف</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-300" />
                <span>الوقائع والأطراف والتهم</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('legality')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'legality'
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Scale className="w-4 h-4 text-amber-300" />
                <span>مشروعية الضبط ومدد التوقيف</span>
                {analysis.proceduralLegality?.proceduralViolations?.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {analysis.proceduralLegality.proceduralViolations.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('testimony')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'testimony'
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 text-indigo-300" />
                <span>مقارنة الأقوال والتناقضات</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('evidence')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'evidence'
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCheck className="w-4 h-4 text-cyan-300" />
                <span>تقييم الأدلة ونظام الإثبات</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('defenses')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'defenses'
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>الدفوع النظامية واستراتيجية البراءة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('consultant')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'consultant'
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>المستشار القضائي المباشر (Chatbot)</span>
              </button>
            </div>

            {/* Tab: Deed Analysis (When doc is a court verdict) */}
            {activeTab === 'deed' && isDeedPresent && (
              <DeedVerdictAnalysisDashboard
                analysis={analysis}
                onOpenAppealGenerator={handleOpenAppealGenerator}
              />
            )}

            {/* Tab 1: Overview, Parties & Charges */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <PartiesCard parties={analysis.parties} />
                <ChargesAndDefensesCard
                  charges={analysis.chargesAndStatutes}
                  defenseStrategy={analysis.defenseStrategy}
                />
              </div>
            )}

            {/* Tab 2: Procedural Legality & Detention Periods */}
            {activeTab === 'legality' && (
              <div className="space-y-6">
                <ProceduralLegalitySection
                  proceduralLegality={analysis.proceduralLegality}
                  arrestDetails={analysis.arrestDetails}
                />
              </div>
            )}

            {/* Tab 3: Testimony Comparison Matrix */}
            {activeTab === 'testimony' && (
              <div className="space-y-6">
                <TestimonyComparisonTable comparisons={analysis.testimonyComparison} />
              </div>
            )}

            {/* Tab 4: Saudi Evidence Law Evaluation */}
            {activeTab === 'evidence' && (
              <div className="space-y-6">
                <EvidenceEvaluationCard
                  evidenceEvaluation={analysis.evidenceEvaluationUnderSaudiEvidenceLaw}
                  physicalEvidence={analysis.physicalEvidence}
                />
              </div>
            )}

            {/* Tab 5: Defenses Strategy */}
            {activeTab === 'defenses' && (
              <div className="space-y-6">
                <ChargesAndDefensesCard
                  charges={analysis.chargesAndStatutes}
                  defenseStrategy={analysis.defenseStrategy}
                />

                {/* Appeal Brief Drafter for Defendant and Family */}
                <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-600/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <span>مساندة أهل المدعى عليه: الطعن في الحكم الاستئنافي</span>
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-500/30 px-2 py-0.2 rounded-full font-semibold">
                        مهيأ لمنصة ناجز و Word
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      صياغة لائحة اعتراضية استئنافية متكاملة تتضمن رصد القصور في التسبيب والفساد في الاستدلال، مع موجبات الرأفة وخلو السوابق ووقف التنفيذ.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDefendantAppealModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-700 hover:from-amber-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-md border border-amber-400/30"
                  >
                    <Gavel className="w-3.5 h-3.5 text-amber-200" />
                    <span>توليد لائحة الاعتراض للمدعى عليه</span>
                  </button>
                </div>

                {/* Trial Memorandum Drafter */}
                <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">
                      هل ترغب في صياغة هذه الدفوع في مذكرة قضائية رسمية للمحكمة الابتدائية؟
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      يتم تحرير المذكرة بالبسملة والوقائع والأسانيد والطلبات الختامية الجازمة
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMemorandumOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-300" />
                    <span>فتح محرر المذكرة القضائية</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 6: Interactive Legal Consultant Multi-Turn Chatbot */}
            {activeTab === 'consultant' && (
              <div className="space-y-6">
                <JudicialConsultantChat analysis={analysis} />
              </div>
            )}

            {/* Mandatory Disclaimer */}
            <DisclaimerBanner customText={analysis.disclaimer} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500 space-y-2">
        <p className="flex items-center justify-center gap-2">
          <span>المستشار والمحلل العدلي الذكي</span>
          <span>•</span>
          <span>الأنظمة القضائية بالمملكة العربية السعودية</span>
        </p>
        <p className="text-[11px] text-slate-600">
          مرجعيات التحليل: نظام الإجراءات الجزائية ولائحته • نظام الإثبات (م/43) • نظام المرافعات الشرعية • الأنظمة الموضوعية
        </p>
      </footer>

      {/* Memorandum Drafter Modal */}
      <MemorandumModal
        isOpen={isMemorandumOpen}
        onClose={() => setIsMemorandumOpen(false)}
        analysis={analysis}
      />

      {/* Appeal Brief Drafter Modal */}
      <AppealBriefModal
        isOpen={isAppealModalOpen}
        onClose={() => setIsAppealModalOpen(false)}
        deed={selectedDeedForAppeal || analysis?.detailedDeed || null}
      />

      {/* Defendant Family Appeal Drafter Modal (Najiz & Word Export) */}
      <DefendantAppealDrafterModal
        isOpen={isDefendantAppealModalOpen}
        onClose={() => setIsDefendantAppealModalOpen(false)}
        analysis={analysis}
        deed={selectedDeedForAppeal || analysis?.detailedDeed || null}
      />

      {/* Statutes Lookup Drawer */}
      <StatutesDrawer isOpen={isStatutesOpen} onClose={() => setIsStatutesOpen(false)} />
    </div>
  );
}
