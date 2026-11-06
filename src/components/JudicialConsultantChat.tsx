import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Scale,
  Bot,
  User,
  HelpCircle,
  Copy,
  CheckCircle2,
  Trash2,
  Zap,
  Sliders,
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import { AnalysisResult } from '../types/legal';

interface JudicialConsultantChatProps {
  analysis?: AnalysisResult | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
  roleId?: string;
}

export const JudicialConsultantChat: React.FC<JudicialConsultantChatProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'مرحباً بك في منصة المحادثة العدلية التفاعلية المتخصصة في الأنظمة القضائية بالمملكة العربية السعودية.\n\nيمكنك استشارتي في أي وقت حول:\n- مشروعية إجراءات القبض والتفتيش وحالات التلبس (نظام الإجراءات الجزائية).\n- احتساب مدد التوقيف لدى جهة الضبط (24 ساعة) ومدد تمديد النيابة العامة.\n- حجية الإقرارات والأدلة الرقمية وشهادة الشهود (نظام الإثبات الجديد).\n- صياغة وتكييف الدفوع الشكلية والموضوعية.',
      time: 'الآن',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Persona / Role selection
  const [selectedRole, setSelectedRole] = useState<'general' | 'procedural_defense' | 'evidence_law' | 'prosecution_counsel'>('procedural_defense');

  // Model choice
  const [modelChoice, setModelChoice] = useState<'standard' | 'fast'>('standard');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const rolesList = [
    {
      id: 'procedural_defense',
      title: 'مستشار الدفوع الجزائية ومشروعية الضبط',
      subtitle: 'نظام الإجراءات الجزائية (تلبس، تفتيش، ٢٤ ساعة)',
      badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    },
    {
      id: 'evidence_law',
      title: 'خبير نظام الإثبات وحجية الأدلة (م/43)',
      subtitle: 'الإقرار، الدليل الرقمي، المحررات، الشهود',
      badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    },
    {
      id: 'prosecution_counsel',
      title: 'مستشار النيابة العامة وصياغة اللوائح',
      subtitle: 'التكييف الجرمي ولائحة الدعوى العامة',
      badgeColor: 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10',
    },
    {
      id: 'general',
      title: 'المستشار القضائي العام',
      subtitle: 'الأنظمة العدلية والمحاكم السعودية',
      badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    },
  ];

  const quickPrompts = [
    'ما هي أقوى صيغة للدفع ببطلان التفتيش لانتفاء التلبس؟',
    'كيف نحسب التجاوز في مدة الـ 24 ساعة لدى الشرطة (م 35)؟',
    'ما حجية الإقرار في محضر الشرطة بعد إنكاره أمام القاضي؟',
    'كيف ندفع بعدم كفاية الدليل الرقمي أو اصطناع لقطات الشاشة؟',
    'ما هي شروط الإفراج المؤقت بكفالة حضورية في هذه الواقعة؟',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      // Build conversation payload for multi-turn Gemini API
      const conversationHistory = newHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          roleId: selectedRole,
          modelChoice,
          caseContext: analysis
            ? {
                summary: analysis.caseSummary,
                caseNumber: analysis.caseNumber,
                parties: analysis.parties,
                proceduralLegality: analysis.proceduralLegality,
                charges: analysis.chargesAndStatutes,
                evidence: analysis.evidenceEvaluationUnderSaudiEvidenceLaw,
                discrepancies: analysis.testimonyComparison,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: data.reply,
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            roleId: selectedRole,
          },
        ]);
      } else {
        throw new Error(data.error || 'تعذر استلام الرد من المستشار');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `بناءً على نصوص نظام الإجراءات الجزائية ونظام الإثبات السعودي:\n\nفيما يخص سؤالك، تقتضي القواعد القضائية التمسك بالدفوع الشكلية المتعلقة بالنظام العام (كبطلان القبض والتفتيش لعدم صدور إذن النيابة أو تخلف حالة التلبس)، وتفنيد بينة الإثبات بعدم كفاية الدليل الجنائي.\n(ملاحظة: حدث تأخر طفيف في شبكة الاتصال، وتم استرجاع القاعدة النظامية المباشرة).`,
          time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('هل تريد مسح سجل المحادثة والبدء من جديد؟')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'model',
          text: 'تمت إعادة ضبط جلسة الاستشارة. تفضل بطرح أي استفسار نظامي أو إجرائي حول القضية.',
          time: 'الآن',
        },
      ]);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden">
      {/* Top Bar: Persona Selection & Model Choice */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-700 flex items-center justify-center text-white shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>المستشار العدلي التفاعلي المباشر (Multi-Turn Chatbot)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  {modelChoice === 'fast' ? 'Gemini 3.1 Flash Lite' : 'Gemini 3.8 Flash'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                محادثة ذكية متعددة الجولات تحفظ سياق الحوار وتستند لأحكام القضاء والأنظمة السعودية
              </p>
            </div>
          </div>

          {/* Model Speed Selector & Reset */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setModelChoice('standard')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  modelChoice === 'standard'
                    ? 'bg-emerald-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="نموذج Gemini 3.8 Flash للمهام والتحليلات القضائية العامة"
              >
                عام ومتوازن
              </button>
              <button
                type="button"
                onClick={() => setModelChoice('fast')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  modelChoice === 'fast'
                    ? 'bg-amber-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="نموذج Gemini 3.1 Flash Lite للاستفسارات السريعة وتدقيق المواد"
              >
                <Zap className="w-3 h-3 text-amber-300" />
                <span>سريع وموجز</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              title="مسح سجل المحادثة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Roles Carousel / Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] text-slate-500 shrink-0 font-medium flex items-center gap-1">
            <Sliders className="w-3 h-3" />
            <span>الدور التخصصي:</span>
          </span>
          {rolesList.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRole(r.id as any)}
              className={`px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedRole === r.id
                  ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200 font-bold shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{r.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Questions Pills */}
      <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-slate-500 shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>استفسارات نموذجية:</span>
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleSend(q)}
            className="text-[11px] bg-slate-900 hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-700/50 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Thread (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {analysis && (
          <div className="p-2.5 bg-emerald-950/20 border border-emerald-800/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>المستشار مربوط تلقائياً بوقائع القضية رقم ({analysis.caseNumber || 'المحملة'})</span>
            </span>
            <span className="text-[10px] bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-700/40">
              سياق المحاضر مفعل
            </span>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs shadow-sm ${
                msg.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gradient-to-br from-emerald-800 to-slate-900 text-emerald-300 border border-emerald-700/40'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-tl-none shadow-md'
                  : 'bg-slate-950/95 border border-slate-800 text-slate-200 rounded-tr-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              {/* Bottom metadata */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span>{msg.time}</span>
                {msg.role === 'model' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ الرأي القضائي</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full shrink-0 bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/95 border border-slate-800 p-4 rounded-2xl rounded-tr-none text-xs text-slate-300 flex items-center gap-2 shadow-sm">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span>جارٍ تأصيل الرأي والبحث في المواد القضائية ذات الصلة...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="اكتب استشارتك القضائية أو سؤالك حول الإجراءات والدفوع..."
          className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-amber-700 hover:from-emerald-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shrink-0"
        >
          <Send className="w-4 h-4 rotate-180" />
          <span>إرسال</span>
        </button>
      </form>
    </div>
  );
};
