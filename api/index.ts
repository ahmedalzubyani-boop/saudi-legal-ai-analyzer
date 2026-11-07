import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { pdfBase64, prompt, systemInstruction } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'مفتاح GEMINI_API_KEY غير متوفر في الخادم' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            ...(pdfBase64 ? [{ inlineData: { mimeType: 'application/pdf', data: pdfBase64 } }] : []),
            { text: prompt || 'قم بتحليل وقائع هذا الحكم واستخراج كافة الدفوع ومذكرة الاعتراض النظامية.' }
          ]
        }
      ],
      config: {
        systemInstruction: systemInstruction || 'أنت مستشار ومحلل عدلي ذكي مختص بالأنظمة القضائية السعودية.'
      }
    });

    return res.status(200).json({ result: response.text });
  } catch (error: any) {
    console.error('Error during legal analysis:', error);
    return res.status(500).json({
      error: 'فشل أثناء معالجة الوثيقة القضائية',
      details: error.message || String(error)
    });
  }
});

export default app;
