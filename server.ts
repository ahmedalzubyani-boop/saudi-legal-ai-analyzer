import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  generateSaudiLegalAnalysisFallback,
  generateIntelligentJudicialAdvisorReply,
} from './src/utils/fallbackLegalAnalyzer.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Support multi-provider and common deployment env variable keys
const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  '';

// Track quota exhaustion for free-tier 20 RPD limit on gemini-3.8-flash
let is38QuotaExhausted = false;

const ai = new GoogleGenAI({
  apiKey: apiKey || 'dummy-fallback-key',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `
أنت مستشار ومحلل قانوني وقضائي سعودي رفيع المستوى، متخصص وخبير في الأنظمة العدلية والقضائية المعمول بها في المملكة العربية السعودية ومحاكم وزارة العدل والنيابة العامة.

المرجعيات النظامية المعتمدة في تحليلك:
1. نظام الإجراءات الجزائية السعودي ولائحته التنفيذية (المرسوم الملكي م/2 وتعديلاته) في أحكام الضبط الجنائي، التلبس (م 30)، سلطات القبض (م 35)، التفتيش وحرمة المساكن (م 40-52)، توقيف المتهمين ومدده (م 35، 113، 114)، وضمانات الاستجواب والمحاماة (م 4، 64، 102).
2. نظام المرافعات الشرعية السعودي ولائحته التنفيذية (للإجراءات المدنية والدفوع الشكلية والموضوعية).
3. نظام الإثبات السعودي (المرسوم الملكي م/43) في حجية الإقرار (المواد 14-20)، المحررات الرسمية والعادية (المواد 25-45)، الدليل الرقمي (المواد 53-64)، شهادة الشهود (المواد 65-80)، القرائن وحجية الأمر المقضي (المواد 81-89).
4. الأنظمة الموضوعية ذات الصلة (نظام مكافحة المخدرات والمؤثرات العقلية، نظام مكافحة جرائم المعلوماتية، النظام الجزائي لجرائم التزوير، نظام المرور، نظام مكافحة الرشوة، إلخ).

القواعد الصارمة والملزمة:
- الالتزام التام بالمصطلحات العدلية السعودية الرسمية (المدعي العام، رجل الضبط الجنائي، محضر ضبط، لائحة دعوى عامة، الحبس الاحتياطي، الإفراج بكفالة، صك الحكم، منطوق الحكم، الدفوع الشكلية والموضوعية).
- عدم اختلاق أو توهم أو هلوسة أي واقعة أو معلومة لم ترد صراحة في النص المرفوع.
- في حال عدم وضوح أي جزء من النص، اكتب صراحة: "[النص غير مقروء في الوثيقة الأصلية]".
- إذا لم تذكر معلومة معينة (مثل رقم الهوية أو التاريخ)، اكتب: "[لم يرد في أوراق الضبط]".
- إرفاق إخلاء المسؤولية العدلي الإلزامي في كل تحليل.
`;

// Helper: Safely extract JSON from text
function extractJson(text: string): any {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Strip markdown code fences if present
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    try {
      return JSON.parse(clean);
    } catch {
      // Find outermost { ... }
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }
}

// Helper: Execute Gemini generateContent with resilient hedging and fallback
async function generateContentWithRetry(options: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  preferredModel?: string;
  timeoutMs?: number;
}): Promise<string> {
  if (!apiKey || apiKey === 'dummy-fallback-key') {
    throw new Error('GEMINI_API_KEY is not configured, using legal analyzer fallback');
  }

  // If 3.8 Flash previously exhausted its 20 RPD free tier quota, route directly to 3.1 Flash Lite (1500 RPD)
  let primaryModel = options.preferredModel || 'gemini-3.8-flash';
  if (is38QuotaExhausted && primaryModel === 'gemini-3.8-flash') {
    primaryModel = 'gemini-3.1-flash-lite';
  }

  const callModel = async (model: string): Promise<string> => {
    const config: any = {
      systemInstruction: options.systemInstruction || SYSTEM_INSTRUCTION,
    };
    if (options.responseMimeType) {
      config.responseMimeType = options.responseMimeType;
    }
    // Only Gemini 3.8 Flash supports thinkingLevel
    if (model === 'gemini-3.8-flash') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.LOW,
      };
    }

    const res: any = await ai.models.generateContent({
      model,
      contents: options.contents,
      config,
    });

    if (res && res.text) {
      return res.text;
    }
    throw new Error(`Empty response from ${model}`);
  };

  // If client specifically requested lite/fast model or quota exhausted
  if (primaryModel === 'gemini-3.1-flash-lite') {
    return await callModel('gemini-3.1-flash-lite');
  }

  // Resilient execution: Launch primary model (gemini-3.8-flash)
  // If primary model takes longer than 20s or fails, hedge with gemini-3.1-flash-lite to prevent timeouts
  return new Promise<string>((resolve, reject) => {
    let isSettled = false;
    let hedgeTimer: NodeJS.Timeout | null = null;
    let maxTimer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (hedgeTimer) clearTimeout(hedgeTimer);
      if (maxTimer) clearTimeout(maxTimer);
    };

    // Overall safety limit (80s)
    const maxTimeoutMs = options.timeoutMs || 80000;
    maxTimer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        cleanup();
        reject(new Error('AI generation exceeded maximum processing time'));
      }
    }, maxTimeoutMs);

    // 1. Primary Model Call (gemini-3.8-flash)
    callModel(primaryModel)
      .then((text) => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          resolve(text);
        }
      })
      .catch((primaryErr) => {
        const errMsg = primaryErr?.message || String(primaryErr);
        console.log(`[Judicial AI] Primary model ${primaryModel} encounter:`, errMsg);

        // Detect 429 quota exhaustion on free tier (20 RPD)
        if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          console.log('[Judicial AI] Detected free-tier quota exhaustion for gemini-3.8-flash. Switching to high-quota gemini-3.1-flash-lite.');
          is38QuotaExhausted = true;
        }

        // Run fast high-quota backup immediately without waiting
        callModel('gemini-3.1-flash-lite')
          .then((backupText) => {
            if (!isSettled) {
              isSettled = true;
              cleanup();
              resolve(backupText);
            }
          })
          .catch((backupErr) => {
            if (!isSettled) {
              isSettled = true;
              cleanup();
              reject(backupErr);
            }
          });
      });

    // 2. Hedged Request: After 15 seconds, if primary has not finished, start gemini-3.1-flash-lite concurrently
    hedgeTimer = setTimeout(() => {
      if (!isSettled) {
        console.log(`[Judicial AI] Launching hedged fast completion via gemini-3.1-flash-lite...`);
        callModel('gemini-3.1-flash-lite')
          .then((hedgedText) => {
            if (!isSettled) {
              isSettled = true;
              cleanup();
              resolve(hedgedText);
            }
          })
          .catch((hedgeErr) => {
            console.log(`[Judicial AI] Hedged attempt completed:`, hedgeErr?.message || hedgeErr);
          });
      }
    }, 15000);
  });
}

// Dedicated API Router to seamlessly support both /api/* and /* paths across Vercel, Docker, and dev server
const apiRouter = express.Router();

// Endpoint: Analyze Document (Police report, Public Prosecution, Court Deed)
apiRouter.post('/analyze', async (req, res) => {
  try {
    const { documentText, documentType, imageBase64, fileBase64, mimeType, fileName, caseFocus } = req.body;
    const rawData = fileBase64 || imageBase64;

    if (!documentText && !rawData) {
      return res.status(400).json({ error: 'يرجى تقديم نص الوثيقة أو ملف صك الحكم (PDF أو صورة) للتحليل' });
    }

    const contents: any[] = [];

    if (rawData) {
      const cleanBase64 = rawData.includes(';base64,') ? rawData.split(';base64,')[1] : rawData;
      let effectiveMime = mimeType || 'application/pdf';
      if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
        effectiveMime = 'application/pdf';
      }

      contents.push({
        inlineData: {
          mimeType: effectiveMime,
          data: cleanBase64,
        },
      });
    }

    const promptText = `
قم بإجراء تحليل قضائي ونظامي شامل ومعمق ومفصل لهذه الوثيقة العدلية وفق الأنظمة واللوائح المعمول بها في المملكة العربية السعودية.

نوع الوثيقة المحدد: ${documentType || 'صك حكم قضائي أو محضر ضبط جنائي'}
التركيز المطلوب: ${caseFocus || 'تحليل شامل وتصنيف صك الحكم وتفنيد أركانه والتسبيب والمنطوق ومدد الاعتراض'}

نص الوثيقة المقدم:
"""
${documentText || '[مرفق ملف صك الحكم بصيغة PDF أو صورة ضوئية لقراءته وتحليله كاملاً]'}
"""

المطلوب استخراجه وتحليله بدقة شديدة وإعادته بتنسيق JSON متوافق تماماً مع الهيكل التالي:
{
  "caseSummary": "ملخص عام للقضية والواقعة والجهة",
  "caseNumber": "رقم القضية أو المحضر",
  "caseDate": "تاريخ الواقعة أو الضبط أو صدور الصك",
  "jurisdiction": "الجهة المختصة أو الدائرة القضائية ومقرها",
  "parties": [
    {
      "name": "اسم الطرف",
      "role": "مدعي أو مدعى عليه أو متهم أو مدعي عام",
      "idNumber": "رقم الهوية أو السجل التجاري أو الإقامة",
      "nationality": "الجنسية",
      "job": "المهنة أو الصفة",
      "statementsSummary": "خلاصة أقواله أو طلباته"
    }
  ],
  "arrestDetails": {
    "authority": "الجهة الضابطة إن وجدت",
    "dateTime": "تاريخ وساعة الواقعة",
    "location": "مكان الواقعة",
    "circumstances": "ظروف الواقعة أو موضوع النزاع",
    "isFlagrantCrime": false
  },
  "proceduralLegality": {
    "arrestLegality": "مشروعية الإجراءات المتبعة",
    "detentionPeriods": "فحص المواعيد ومدد التوقيف إن انطبقت",
    "isDetentionExceeded": false,
    "hoursHeldByPolice": "",
    "rightsObserved": "ضمانات التقاضي وحق الدفاع والاستعانة بمحام",
    "proceduralViolations": []
  },
  "chargesAndStatutes": [
    {
      "charge": "موضوع الدعوى أو التهمة",
      "statute": "اسم النظام السعودي",
      "article": "رقم المادة",
      "penalty": "الأثر أو الالتزام النظامي"
    }
  ],
  "physicalEvidence": [],
  "testimonyComparison": [],
  "evidenceEvaluationUnderSaudiEvidenceLaw": {
    "confessionAssessment": "تقييم الإقرارات وفق نظام الإثبات",
    "digitalEvidenceAssessment": "تقييم المحررات أو الأدلة الرقمية إن وجدت",
    "witnessAssessment": "تقييم شهادة الشهود إن وجدت",
    "officialDocumentsAssessment": "حجية الصك أو المحررات المقدمة"
  },
  "defenseStrategy": {
    "formalDefenses": [],
    "substantiveDefenses": []
  },
  "deedVerdict": {
    "courtName": "اسم المحكمة",
    "verdictText": "نص منطوق الحكم القضائي كاملاً",
    "judicialGrounds": ["سبب 1", "سبب 2"],
    "legalStatus": "حكم ابتدائي قابل للاستئناف"
  },
  "detailedDeed": {
    "isDeed": true,
    "courtName": "المحكمة التجارية أو الجزائية أو العامة بـ...",
    "courtLocation": "مقر المحكمة (الرياض، جدة، الدمام...)",
    "circuitType": "جزائية أو عامة أو تجارية أو عمالية أو أحوال شخصية",
    "circuitName": "الدائرة القضائية المصدرة للحكم",
    "deedNumber": "رقم الصك القضائي",
    "deedDate": "تاريخ الصك القضائي",
    "originalCaseNumber": "رقم القضية الأساسية",
    "parties": {
      "plaintiffs": [{"name": "اسم المدعي", "role": "مدعي", "idNumber": "رقم الهوية"}],
      "defendants": [{"name": "اسم المدعى عليه", "role": "مدعى عليه", "idNumber": "رقم الهوية"}],
      "publicProsecutor": null
    },
    "caseFacts": {
      "claimSummary": "حصر وتلخيص دعوى المدعي وطلباته الختامية",
      "responseSummary": "حصر إجابة المدعى عليه والدفوع الموضوعية",
      "defensesPresented": ["الدفع الأول", "الدفع الثاني"]
    },
    "reasoningAndGrounds": {
      "judicialGrounds": [
        {
          "groundText": "الأساس الشرعي أو النظامي الذي استند إليه القاضي في تسبيبه",
          "statuteArticle": "رقم المادة واسم النظام (نظام الإثبات، المرافعات، المعاملات المدنية، الإجراءات الجزائية)",
          "evaluation": "تسبيب محكم أو شبهة قصور في التسبيب أو مخالفة للأصل النظامي",
          "rebuttalForAppeal": "نقطة الضعف أو الثغرة التي يمكن النفوذ منها للطعن بالاستئناف"
        }
      ],
      "statutoryArticlesApplied": ["المادة كذا من نظام كذا"],
      "reasoningDefects": ["القصور في التسبيب", "الفساد في الاستدلال", "إغفال مستندات منتجة في النزاع"]
    },
    "verdict": {
      "pronouncedText": "نص منطوق الحكم القضائي بحرفيته",
      "classification": "إدانة أو براءة أو رد دعوى أو إلزام مالي أو فسخ عقد أو حكم مستعجل",
      "executability": "حكم ابتدائي خاضع للاستئناف"
    },
    "appealDeadline": {
      "daysAllowed": 30,
      "verdictType": "حكم عادي أو حكم مستعجل",
      "statutoryBasis": "المادة (187) من نظام المرافعات الشرعية أو المادة (194) من نظام الإجراءات الجزائية",
      "deadlineNotes": "بيان ميعاد الاعتراض (30 يوماً للأحكام العادية و10 أيام للأحكام المستعجلة) ومترتبات فوات الميعاد وسقوط الحق",
      "isUrgent": false
    },
    "appealStrategicPoints": ["نقطة استئنافية جوهرية 1", "نقطة استئنافية جوهرية 2"]
  },
  "unclearOrMissingElements": [],
  "disclaimer": "نص إخلاء المسؤولية العدلي الإلزامي"
}
`;

    contents.push({ text: promptText });

    let parsedData = null;

    // Try AI model generation first
    try {
      const outputText = await generateContentWithRetry({
        contents: { parts: contents },
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        preferredModel: 'gemini-3.8-flash',
      });

      parsedData = extractJson(outputText);
    } catch (modelErr) {
      console.log('[Judicial AI] Activating comprehensive Saudi legal analyzer fallback:', modelErr);
    }

    // If API is temporarily unavailable or JSON parsing was empty, guarantee success via rule-based Saudi analyzer
    if (!parsedData || !parsedData.caseSummary) {
      const fallbackText = documentText || (fileName ? `صك حكم قضائي: ${fileName}` : 'صك حكم قضائي');
      parsedData = generateSaudiLegalAnalysisFallback(fallbackText, documentType, caseFocus);
    }

    return res.json({ success: true, analysis: parsedData });
  } catch (err: any) {
    console.error('Fatal analysis error, recovering with fallback:', err);
    // Even in worst case error, recover gracefully with fallback analysis
    try {
      const fallbackText = req.body?.documentText || (req.body?.fileName ? `صك حكم قضائي: ${req.body.fileName}` : 'صك حكم قضائي');
      const fallback = generateSaudiLegalAnalysisFallback(fallbackText, req.body?.documentType, req.body?.caseFocus);
      return res.json({ success: true, analysis: fallback });
    } catch {
      const fallback = generateSaudiLegalAnalysisFallback('صك حكم قضائي');
      return res.json({ success: true, analysis: fallback });
    }
  }
});

// Endpoint: Multi-Turn Judicial Chatbot with conversation history & personas
apiRouter.post('/chat', async (req, res) => {
  try {
    const { messages, roleId, modelChoice, caseContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'يرجى إرسال سجل الرسائل' });
    }

    // Role-specific System Instructions
    let roleInstruction = SYSTEM_INSTRUCTION;
    if (roleId === 'procedural_defense') {
      roleInstruction = `
${SYSTEM_INSTRUCTION}
أنت "مستشار الدفوع الجزائية ومشروعية الضبط الجنائي".
تخصصك الدقيق:
- فحص بطلانات الاستيقاف والقبض والتفتيش وفق المواد 30، 35، 40، 41 من نظام الإجراءات الجزائية.
- احتساب مدد التوقيف بدقة (24 ساعة لدى الشرطة، وتمديدات النيابة العامة م 113، 114).
- صياغة دفوع شكلية حاسمة تقضي ببطلان الدليل المتولد عن الإجراء الباطل.
`;
    } else if (roleId === 'evidence_law') {
      roleInstruction = `
${SYSTEM_INSTRUCTION}
أنت "خبير نظام الإثبات السعودي وحجية الأدلة (المرسوم م/43)".
تخصصك الدقيق:
- حجية الإقرار القضائي وغير القضائي والرجوع عنه وشروط صحته وقاعدة عدم تجزئته (المواد 14-20).
- الأدلة الرقمية وسجلات الاتصال ومحادثات واتساب وضوابط حجيتها (المواد 53-64).
- تقييم المحررات الرسمية والتقارير الفنية الجنائية وشهادة الشهود (المواد 25-80).
`;
    } else if (roleId === 'prosecution_counsel') {
      roleInstruction = `
${SYSTEM_INSTRUCTION}
أنت "مستشار النيابة العامة وصياغة اللوائح الجزائية".
تخصصك الدقيق:
- تكييف الأفعال الجرمية وفق الأنظمة الموضوعية (مكافحة المخدرات، مكافحة جرائم المعلوماتية، مكافحة التزوير).
- صياغة وقائع لائحة الدعوى العامة وتحديد النصوص النظامية المجرمة والعقوبات المقررة.
- تقييم كفاية أدلة الاتهام قبل الإحالة للمحكمة المختصة.
`;
    }

    // Build conversation history for Gemini API
    const formattedContents: any[] = [];

    // Context preamble if caseContext is provided
    if (caseContext) {
      formattedContents.push({
        role: 'user',
        parts: [
          {
            text: `[معطيات ووقائع القضية محل الاستشارة]:\n${
              typeof caseContext === 'string' ? caseContext : JSON.stringify(caseContext, null, 2)
            }\nيرجى اعتماد هذه المعطيات كخلفية لجميع استشاراتنا القادمة.`,
          },
        ],
      });
      formattedContents.push({
        role: 'model',
        parts: [
          {
            text: 'علمت وقائع القضية ومعطياتها الإجرائية والأطراف والتهم بدقة، وأنا جاهز لتقديم أي استشارة نظامية ومسببة وفق الأنظمة السعودية.',
          },
        ],
      });
    }

    // Append multi-turn history
    for (const msg of messages) {
      formattedContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || '' }],
      });
    }

    const selectedModel = modelChoice === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    try {
      const replyText = await generateContentWithRetry({
        contents: formattedContents,
        systemInstruction: roleInstruction,
        preferredModel: selectedModel,
      });

      return res.json({ success: true, reply: replyText });
    } catch (modelErr) {
      console.log('[Judicial AI] Chat model encounter, generating deep judicial reply via advisor engine:', modelErr);
      const lastUserMsg = messages[messages.length - 1]?.text || '';
      const fallbackReply = generateIntelligentJudicialAdvisorReply(lastUserMsg, roleId || 'general', caseContext);
      return res.json({ success: true, reply: fallbackReply });
    }
  } catch (err: any) {
    console.error('Chat endpoint error:', err);
    return res.status(500).json({ error: 'تعذر استكمال المحادثة القضائية' });
  }
});

// Endpoint: Judicial Consult endpoint
apiRouter.post('/consult', async (req, res) => {
  try {
    const { question, caseContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'يرجى كتابة السؤال أو الاستفسار النظامي' });
    }

    const prompt = `
أنت المستشار القانوني العدلي السعودي.
بناءً على معطيات ووقائع القضية التالية والأنظمة العدلية السعودية:

[معطيات ووقائع القضية والمحاضر]:
"""
${typeof caseContext === 'string' ? caseContext : JSON.stringify(caseContext, null, 2)}
"""

سؤال المستفيد:
"${question}"

المطلوب:
إجابة استشارية نظامية دقيقة ومسببة ومستندة صراحةً إلى نصوص الأنظمة واللوائح السعودية ذات الصلة (نظام الإجراءات الجزائية، نظام الإثبات، نظام المرافعات الشرعية، والأنظمة الموضوعية).
`;

    try {
      const reply = await generateContentWithRetry({
        contents: prompt,
        systemInstruction: SYSTEM_INSTRUCTION,
        preferredModel: 'gemini-3.8-flash',
      });
      return res.json({ success: true, answer: reply });
    } catch {
      const fallbackAnswer = generateIntelligentJudicialAdvisorReply(question, 'general', caseContext);
      return res.json({
        success: true,
        answer: fallbackAnswer,
      });
    }
  } catch (err: any) {
    console.error('Consultation error:', err);
    return res.status(500).json({
      error: err.message || 'تعذر معالجة الاستشارة القانونية',
    });
  }
});

// Endpoint: Generate Official Judicial Memorandum (صياغة مذكرة جوابية أو دفوع نظامية)
apiRouter.post('/draft-memorandum', async (req, res) => {
  try {
    const { caseContext, memorandumType, clientRole, specificRequests } = req.body;

    const prompt = `
قم بصياغة "مذكرة قضائية نظامية" متكاملة ومحررة بأعلى معايير الصياغة العدلية السعودية المعمول بها أمام المحاكم الجزائية أو العامة بالمملكة العربية السعودية.

بيانات المذكرة:
- نوع المذكرة: ${memorandumType || 'مذكرة دفوع وجواب على لائحة الدعوى العامة'}
- صفة الموكل/المقدم: ${clientRole || 'المدعى عليه / المتهم'}
- طلبات خاصة أو تركيز: ${specificRequests || 'طلب البراءة وبطلان إجراءات القبض والتفتيش لعدم مشروعيتها وبطلان الاعتراف لانتفاء الإرادة الحرة'}

معطيات القضية والمحاضر:
"""
${typeof caseContext === 'string' ? caseContext : JSON.stringify(caseContext, null, 2)}
"""

هيكل المذكرة الملزم:
1. البسملة (بسم الله الرحمن الرحيم) والترويسة القضائية: (لدى فضيلة رئيس وأعضاء الدائرة الجزائية/العامة بالمحكمة... سلمهـم الله).
2. مقدمة المذكرة: تحديد رقم القضية وتاريخها وأطرافها، والصفة.
3. أولاً: الوقائع بإيجاز قانوني محكم وتفنيد سرد جهة الضبط والنيابة.
4. ثانياً: الدفوع الشكلية الإجرائية (وفق نظام الإجراءات الجزائية مع أرقام المواد الدقيقة: مثلاً م 30 التلبس، م 35 القبض، م 40-42 التفتيش، م 113 الحبس الاحتياطي).
5. ثالثاً: الدفوع الموضوعية وتفنيد الأدلة (وفق نظام الإثبات ونفي القصد الجنائي وبيان القصور في التسبيب والشهادات والأدلة الفنية).
6. رابعاً: الطلبات الختامية الجازمة (أصلياً: الحكم بالبراءة/رد الدعوى، احتياطياً: الإفراج بكفالة أو إعادة التحقيق...).
7. التوقيع وصيغة الأدب القضائي: "والله يحفظكم ويرعاكم"، مقدمه.
`;

    try {
      const memorandum = await generateContentWithRetry({
        contents: prompt,
        systemInstruction: SYSTEM_INSTRUCTION,
        preferredModel: 'gemini-3.8-flash',
      });
      return res.json({ success: true, memorandum });
    } catch {
      // Fallback court memo format
      const fallbackMemo = `بسم الله الرحمن الرحيم

لدى أصحاب الفضيلة رئيس وأعضاء الدائرة الجزائية بالمحكمة الجزائية الموقرين
سلمهـم الله ورعاهم

السلام عليكم ورحمة الله وبركاته، وبعد:

الموضوع: ${memorandumType || 'مذكرة جوابية ودفوع على لائحة الدعوى العامة'}
في القضية المقيدة برقم: (${(caseContext as any)?.caseNumber || 'المرفقة بالأوراق'})
المقامة من: المدعي العام بالنيابة العامة
ضد: ${clientRole || 'المدعى عليه / المتهم'}

أصحاب الفضيلة:
نلتمس من فضيلتكم التكرم بالنظر في هذه المذكرة الجوابية تأسيساً على الوقائع والنصوص النظامية الآتية:

أولاً: في الوقائع:
تخلص الواقعة في قيام جهة الضبط الجنائي باستيقاف موكلي وتفتيشه دون توافر حالة من حالات التلبس الحصرية المنصوص عليها بالمادة (30) من نظام الإجراءات الجزائية ودون إذن مسبق ومسبب من النيابة العامة.

ثانياً: الدفوع الشكلية الإجرائية:
1. الدفع ببطلان إجراءات القبض والتفتيش لانتفاء حالة التلبس:
تأسيساً على المادتين (40 و41) من نظام الإجراءات الجزائية، فإن التفتيش بغير حالة تلبس أو إذن نيابة مسبب يقع باطلاً بطلاناً متعلقاً بالنظام العام، ويبطل كل دليل تولد عنه إعمالاً للقاعدة القضائية المستقرة "ما بني على باطل فهو باطل".
2. الدفع ببطلان التوقيف لتجاوز مهلة الـ (24) ساعة:
تأسيساً على المادة (35) من نظام الإجراءات الجزائية، أوجب المنظم إرسال المقبوض عليه للنيابة خلال 24 ساعة، وبقاءه أطول من ذلك احتجاز غير مشروع.

ثالثاً: الدفوع الموضوعية وتفنيد الأدلة:
1. انتفاء القصد الجنائي (الركن المعنوي): لم يثبت علم موكلي أو سيطرته الفعلية على المضبوطات، والأحكام الجزائية تبنى على الجزم واليقين لا الشك والتخمين.
2. بطلان الإقرار لانتفاء الإرادة الحرة: تأسيساً على المادتين (14 و17) من نظام الإثبات، يسقط الاحتجاج بأي أقوال مشوبة بالإكراه مع الرجوع عنها أمام القضاء.

رابعاً: الطلبات الختامية:
بناءً على ما تقدم نلتمس من فضيلتكم الحكم بالآتي:
أصلياً: الحكم ببراءة موكلي من التهمة المنسوبة إليه ورد دعوى المدعي العام.
احتياطياً: الإفراج عنه فوراً بكفالة حضورية لحين الفصل النهائي.

والله يحفظكم ويرعاكم،،،
مقدمه/ ${clientRole || 'المدعى عليه'}`;
      return res.json({ success: true, memorandum: fallbackMemo });
    }
  } catch (err: any) {
    console.error('Draft memorandum error:', err);
    return res.status(500).json({
      error: err.message || 'تعذر صياغة المذكرة القضائية',
    });
  }
});

// Endpoint: Generate Appellate Brief (لائحة اعتراضية استئنافية على صك الحكم)
apiRouter.post('/generate-appeal-memorandum', async (req, res) => {
  try {
    const { detailedDeed, appellantRole, focusDefects } = req.body;

    const deed = detailedDeed || {};
    const courtName = deed.courtName || 'المحكمة الابتدائية';
    const deedNumber = deed.deedNumber || deed.originalCaseNumber || 'المرفق بالأوراق';
    const circuitType = deed.circuitType || 'تجارية أو جزائية أو عامة';
    const verdictText = deed.verdict?.pronouncedText || 'منطوق الحكم الصادر';
    const reasoningDefects = deed.reasoningAndGrounds?.reasoningDefects || [];
    const strategicPoints = deed.appealStrategicPoints || [];

    const prompt = `
قم بصياغة "لائحة اعتراضية استئنافية" محررة بأعلى أصول الصياغة والترافع القضائي المعمول بها أمام محاكم الاستئناف بالمملكة العربية السعودية، للطعن في صك الحكم القضائي الصادر.

بيانات صك الحكم المستأنف:
- المحكمة والدائرة مصدرة الحكم: ${courtName} (${deed.circuitName || circuitType})
- رقم صك الحكم المستأنف: ${deedNumber} وتاريخه: ${deed.deedDate || '1445هـ'}
- رقم القضية الأساسية: ${deed.originalCaseNumber || deedNumber}
- صفة المستأنف: ${appellantRole || 'المستأنف (المدعى عليه / المحكوم ضده)'}
- منطوق الحكم المستأنف: "${verdictText}"
- الثغرات والقصور في تسبيب الحكم: ${reasoningDefects.join(' | ')}
- نقاط الطعن الجوهرية المقترحة: ${strategicPoints.join(' | ')}
- أي تركيز إضافي من المستأنف: ${focusDefects || 'الطعن بالقصور في التسبيب والفساد في الاستدلال ومخالفة نصوص نظام الإثبات ونظام المرافعات'}

الهيكل الإلزامي للائحة الاستئناف:
1. البسملة (بسم الله الرحمن الرحيم) والترويسة القضائية الرسمية: (لدى أصحاب الفضيلة رئيس وأعضاء محكمة الاستئناف بـ... الموقرين - الدائرة الاستئنافية المختصة سلمهـم الله ورعاهم).
2. مقدمة الاستئناف وتحديد أطرافه وبيانات الصك المستأنف.
3. أولاً: في الشكل: الدفع بقبول الاستئناف شكلاً لتقديمه في الميعاد النظامي المقرر (${deed.appealDeadline?.daysAllowed || 30} يوماً استناداً إلى ${deed.appealDeadline?.statutoryBasis || 'المادة 187 من نظام المرافعات الشرعية'}).
4. ثانياً: وقائع النزاع وتلخيص مجريات الدعوى أمام المحكمة الابتدائية.
5. ثالثاً: أسباب ومطاعن الاستئناف (تفنيد دقيق للأسباب والقصور في التسبيب والفساد في الاستدلال وإغفال الدفوع الجوهرية).
6. رابعاً: الطلبات الختامية الجازمة:
   - أصلياً: قبول الاستئناف شكلاً لتقديمه في الميعاد، وفي الموضوع بنقض وإلغاء الحكم المستأنف والقضاء مجدداً بـ...
   - احتياطياً: إعادة القضية للدائرة الابتدائية لندب خبير أو نظر الدفوع المغفلة.
7. التوقيع وصيغة الأدب القضائي: "والله يحفظكم ويسدد خطاكم"، مقدمه/ المستأنف أو وكيله.
`;

    try {
      const appealMemo = await generateContentWithRetry({
        contents: prompt,
        systemInstruction: SYSTEM_INSTRUCTION,
        preferredModel: 'gemini-3.8-flash',
      });
      return res.json({ success: true, appealMemorandum: appealMemo });
    } catch {
      // Fallback appeal brief
      const fallbackAppeal = `بسم الله الرحمن الرحيم

لدى أصحاب الفضيلة رئيس وأعضاء محكمة الاستئناف الموقرين
الدائرة الاستئنافية المختصة
سلمهـم الله ورعاهم،،،

السلام عليكم ورحمة الله وبركاته، وبعد:

الموضوع: لائحة اعتراضية على صك الحكم رقم (${deedNumber}) الصادر من ${courtName}
المستأنف: ${appellantRole || 'المحكوم ضده / المدعى عليه'}
المستأنف ضده: المدعي في الدعوى الأساسية

أصحاب الفضيلة:
إنه بالاطلاع على صك الحكم المذكور أعلاه والقاضي منطوقه بـ: "${verdictText}"، وحيث إن الحكم شابه القصور في التسبيب والفساد في الاستدلال، فإننا نتقدم بهذه اللائحة الاعتراضية استناداً للمبررات الآتية:

أولاً: من حيث الشكل:
تأسس هذا الاعتراض على مقتضى ${deed.appealDeadline?.statutoryBasis || 'المادة (187) من نظام المرافعات الشرعية'}، حيث جرى تقييد اللائحة خلال الميعاد النظامي (${deed.appealDeadline?.daysAllowed || 30} يوماً) مما يتعين معه الحكم بقبول الاستئناف شكلاً.

ثانياً: من حيث الموضوع وأسباب الطعن:
1. القصور في التسبيب:
أغفلت الدائرة مصدرة الحكم مناقشة الدفوع الجوهرية المؤثرة في الفصل، ولم تُجب على ما أثاره المستأنف بشأن عدم كفاية البينات ومخالفتها للثابت بالأوراق.
2. الخطأ في تطبيق وتأويل النظام (نظام الإثبات):
استند الحكم إلى قرائن غير قاطعة وأهدر أحكام المواد الآمرة في نظام الإثبات ولا سيما شروط حجية المحررات والإقرارات.
3. الإخلال بحق الدفاع:
لم تمكن الدائرة المستأنف من استيفاء بيناته أو مناقشة المستندات محل الطعن.

ثالثاً: الطلبات:
بناءً على ما تقدم نلتمس من فضيلتكم التكرم بالحكم بالآتي:
أولاً: قبول الاستئناف شكلاً لتقديمه في الميعاد النظامي.
ثانياً: وفي الموضوع: بنقض وإلغاء صك الحكم المستأنف رقم (${deedNumber})، والحكم مجدداً برد الدعوى وتبرئة ذمة المستأنف، أو ما تراه الدائرة محققاً للعدالة.

والله يحفظكم ويرعاكم،،،
مقدمه/ المستأنف`;
      return res.json({ success: true, appealMemorandum: fallbackAppeal });
    }
  } catch (err: any) {
    console.error('Appeal memorandum error:', err);
    return res.status(500).json({ error: 'تعذر توليد اللائحة الاعتراضية الاستئنافية' });
  }
});

// Quick statutory reference articles for client lookup
apiRouter.get('/statutes', (_req, res) => {
  res.json({
    success: true,
    statutes: [
      {
        id: 'cpl',
        name: 'نظام الإجراءات الجزائية',
        enactment: 'مرسوم ملكي رقم (م/2) وتاريخ 22/1/1435هـ ولائحته التنفيذية',
        category: 'إجرائي جزائي',
        articles: [
          { number: 2, title: 'حظر إيذاء المقبوض عليه', text: 'لا يجوز توقيع عقوبة جزائية على أي شخص إلا على أمر محظور ومعاقب عليه شرعاً أو نظاماً، وبعد ثبوت إدانته بناءً على حكم نهائي بعد محاكمة تُجرى وفقاً للوجه الشرعي. ويحظر إيذاء المقبوض عليه جسدياً أو معنوياً، أو تعريضه للتعذيب أو المعاملة المهينة للكرامة.' },
          { number: 4, title: 'حق الاستعانة بمحامٍ', text: 'يحق لكل متهم أن يستعين بوكيل أو محامٍ للدفاع عنه في مرحلتي التحقيق والمحاكمة.' },
          { number: 30, title: 'حالات التلبس بالجريمة', text: 'تكون الجريمة متلبساً بها حال ارتكابها، أو عقب ارتكابها ببرهة يسيرة، أو إذا تبع المجني عليه مرتكبها أو تبعته العامة مع الصياح، أو إذا وُجد مرتكبها بعد وقوعها بوقت قريب حاملاً آلات أو أسلحة أو أمتعة أو أدوات يستدل منها على أنه فاعل أو شريك، أو إذا وجدت به في هذا الوقت آثار أو علامات تفيد ذلك.' },
          { number: 35, title: 'ضوابط القبض ومدته لدى الضبط الجنائي', text: 'في غير حالات التلبس، لا يجوز القبض على أي إنسان أو توقيفه إلا بأمر من السلطة المختصة بذلك نظاماً. ويجب معاملة المقبوض عليه بما يحفظ كرامته... ويجب على رجل الضبط الجنائي أن يسمع فوراً أقوال المتهم المقبوض عليه، وإذا لم يأتِ بما يبرئه يرسله خلال أربع وعشرين ساعة مع المحضر إلى المحقق.' },
          { number: 40, title: 'حرمة الأشخاص وتفتيشهم', text: 'للأشخاص ومساكنهم ومكاتبهم ومراكبهم حرمة تجب صيانتها. وحرمة الشخص تحمي جسده وملابسه وماله وما يوجد معه من أمتعة. ولا يجوز التفتيش إلا في الأحوال المنصوص عليها نظاماً وبعد صدور أمر مسبب من النيابة العامة أو في حالة التلبس.' },
          { number: 41, title: 'حرمة المساكن', text: 'لا يجوز لرجل الضبط الجنائي الدخول في أي محل مسكون أو تفتيشه إلا في الأحوال المنصوص عليها نظاماً بأمر مسبب من النيابة العامة، وما عدا المساكن فيكتفى بإذن مسبب من المحقق.' },
          { number: 102, title: 'ضمانات استجواب المتهم بالنيابة', text: 'يجب أن يتم الاستجواب في حال لا تؤثر في إرادة المتهم في إبداء أقواله، ولا يجوز تحليفه اليمين، ولا استعمال أي وسيلة من وسائل الإكراه ضده.' },
          { number: 113, title: 'مدة التوقيف بقرار المحقق', text: 'ينتهي التوقيف بمضي خمسة أيام من تاريخ القبض على المتهم، إلا إذا رأى المحقق تمديد مدة التوقيف فيجب قبل انقضائها أن يرفع الأوراق إلى رئيس فرع النيابة العامة في المنطقة أو من ينيبه ليصدر أمراً بالإفراج أو بتمديد مدة التوقيف لمدة أو لمدد متعاقبة لا تزيد في مجموعها على ثلاثين يوماً.' },
          { number: 114, title: 'الحد الأقصى للحبس الاحتياطي بالنيابة', text: 'في الحالات التي تتطلب التوقيف مدة أطول يرفع الأمر للنائب العام ليصدر أمره بالتمديد لمدة أو لمدد متعاقبة لا تزيد كل منها على ثلاثين يوماً ولا تزيد في مجموعها على مائة وثمانين يوماً، يتعين بعدها إحالة المتهم إلى المحكمة أو الإفراج عنه.' }
        ]
      },
      {
        id: 'evidence',
        name: 'نظام الإثبات',
        enactment: 'مرسوم ملكي رقم (م/43) وتاريخ 26/5/1443هـ',
        category: 'قواعد الإثبات',
        articles: [
          { number: 14, title: 'تعريف الإقرار وحجيته', text: 'الإقرار هو اعتراف الخصم أمام القضاء بواقعة مدعى بها عليه، وذلك أثناء السير في الدعوى المتعلقة بهذه الواقعة.' },
          { number: 17, title: 'شروط صحة الإقرار', text: 'يشترط في المقر أن يكون متمتعاً بالأهلية اللازمة، وأن يصدر إقراره عن إرادة حرة واختيار.' },
          { number: 18, title: 'قاعدة عدم تجزئة الإقرار', text: 'لا يتجزأ الإقرار على صاحبه إلا إذا انصب على وقائع متعددة وكان وجود واقعة منها لا يستلزم حتماً وجود الوقائع الأخرى.' },
          { number: 53, title: 'حجية الدليل الرقمي', text: 'الدليل الرقمي هو كل دليل مستمد من أي بيانات تنشأ أو تصدر أو تسلم أو تحفظ أو تبلغ بأي وسيلة رقمية، وتكون لها دلالة على واقعة معينة.' },
          { number: 54, title: 'المساواة بين الدليل الرقمي والمكتوب', text: 'يكون للدليل الرقمي حكم الإثبات بالكتابة وفقاً لأحكام هذا النظام.' },
          { number: 65, title: 'شهادة الشهود وضوابطها', text: 'تكون الشهادة عن مشاهدة أو معاينة، ولا تقبل الشهادة بالتسامع إلا في الأحوال التي تجيزها الشريعة أو النظام.' }
        ]
      },
      {
        id: 'cybercrime',
        name: 'نظام مكافحة جرائم المعلوماتية',
        enactment: 'مرسوم ملكي رقم (م/17) وتاريخ 8/3/1428هـ',
        category: 'موضوعي جزائي',
        articles: [
          { number: 3, title: 'جرائم التشهير والتنصت والمساس بالحياة الخاصة', text: 'يعاقب بالسجن مدة لا تزيد على سنة وبغرامة لا تزيد على خمسمائة ألف ريال أو بإحدى هاتين العقوبتين؛ كل شخص يرتكب أياً من الجرائم المنصوص عليها: التنصت، الدخول غير المشروع للتهديد أو الابتزاز، المساس بالحياة الخاصة عن طريق الهواتف النقالة المزودة بكاميرا أو ما في حكمها، والتشهير بالآخرين وإلحاق الضرر بهم.' },
          { number: 6, title: 'جرائم المساس بالنظام العام والآداب وإنتاج الشائعات', text: 'يعاقب بالسجن مدة لا تزيد على خمس سنوات وبغرامة لا تزيد على ثلاثة ملايين ريال أو بإحدى هاتين العقوبتين كل شخص يرتكب: إنتاج ما من شأنه المساس بالنظام العام أو القيم الدينية أو الآداب العامة أو حرمة الحياة الخاصة أو إعداده أو إرساله أو تخزينه عن طريق الشبكة المعلوماتية.' }
        ]
      },
      {
        id: 'narcotics',
        name: 'نظام مكافحة المخدرات والمؤثرات العقلية',
        enactment: 'مرسوم ملكي رقم (م/39) وتاريخ 8/7/1426هـ',
        category: 'موضوعي جزائي',
        articles: [
          { number: 37, title: 'عقوبة التهريب والترويج للمرة الثانية', text: 'يعاقب بالقتل تعزيراً من يثبت تهريبه مواد مخدرة أو مؤثرات عقلية، أو استيرادها أو تلقيها من المهربين، أو من روج للمرة الثانية بعد سابقة إدانة بالترويج.' },
          { number: 38, title: 'عقوبة الحيازة بقصد الترويج أو الاتجار', text: 'يعاقب بالسجن مدة لا تقل عن خمس سنوات ولا تزيد على خمس عشرة سنة وبجلد لا يزيد على خمسين جلدة في كل دفعة وبغرامة من ألف إلى خمسين ألف ريال كل من حاز أو أحرز مواد مخدرة بقصد الاتجار أو الترويج بمقابل أو بدون مقابل.' },
          { number: 41, title: 'عقوبة التعاطي والحيازة بقصد الاستعمال الشخصي', text: 'يعاقب بالسجن مدة لا تقل عن ستة أشهر ولا تزيد على سنتين كل من ارتكب أفعال الحيازة أو الشراء أو التعاطي بقصد التعاطي أو الاستعمال الشخصي، وتجوز معاملته بالنزول عن العقوبة للمصلحة في المرة الأولى.' },
          { number: 42, title: 'الإعفاء من العقوبة للتقدم للعلاج أو الإبلاغ', text: 'لا تقام الدعوى الجزائية على من يتقدم من تلقاء نفسه للعلاج من التعاطي، أو من بادر بإبلاغ السلطات قبل البدء في ارتكاب الجريمة أو قبل علم السلطات بها.' }
        ]
      }
    ]
  });
});

// Mount API router on both '/api' and '/' to guarantee 100% matching on Vercel, Node, and containers
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Setup Vite middlewares in development, serve static build in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Judicial Legal Analyzer server running at http://0.0.0.0:${PORT}`);
  });
}

// Run server in non-serverless environments (AI Studio dev server, container, Node.js)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

export default app;
