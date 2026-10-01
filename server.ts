import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Google GenAI securely on the server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// === Server-Side Gemini API Proxy Endpoint ===
app.post('/api/generate-caption', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'الرجاء توفير الفكرة أو الكلمة المفتاحية لصياغة الوصف.' });
  }

  if (!ai) {
    // Elegant fallback simulation if API Key is not set in local development env
    // (This ensures zero-friction immediate development)
    const mockCaptions = [
      `مغامرة جديدة اليوم في أحضان الطبيعة الساحرة! 🌲✨ لا تنسوا متابعة الحساب للمزيد من اللحظات الملهمة. #طبيعة #هدوء #استرخاء #نبض`,
      `البرمجة ليست مجرد كتابة أكواد، بل هي فن صناعة المستقبل! 💻🚀 ما هي لغتكم البرمجية المفضلة؟ #تطوير #ذكاء_اصطناعي #برمجة #نبض_التقنية`,
      `البدايات الجديدة دائماً ما تحمل معها فرصاً أعظم وأجمل 💫🖤. صباح الخير والتفاؤل للجميع! #صباح_الخير #طاقة_إيجابية #تفاؤل #يوميات`,
      `كوب قهوة دافئ وتأمل في تفاصيل الحياة الهادئة ⛰️☕️. شاركونا طقوس صباحكم المميز اليوم! #قهوة_الصباح #مزاج #روقان #سفر`
    ];
    const randomCaption = mockCaptions[Math.floor(Math.random() * mockCaptions.length)];
    return res.json({ text: `${randomCaption}\n\n(تمت المحاكاة لعدم توفر مفتاح GEMINI_API_KEY)` });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `أنت صانع محتوى خبير ومؤثر على منصات التواصل الاجتماعي العالمية (مثل تيك توك وإنستقرام). 
اكتب وصفاً إبداعياً وجذاباً وتفاعلياً للغاية باللغة العربية، غنياً بالتعبيرات الرائعة والرموز التعبيرية (Emoji)، 
وأضف في نهاية الوصف 4 أو 5 هاشتاغات رائجة جداً ومترابطة مع الفكرة التالية: "${prompt}". 
اجعل الوصف مشوقاً ومحفزاً للمتابعين على وضع تعليقات ومشاركات.`,
    });

    const generatedText = response.text || '';
    return res.json({ text: generatedText });
  } catch (error: any) {
    console.error('Gemini error:', error);
    return res.status(500).json({ error: 'فشل توليد الوصف الذكي عبر خادم جيميناي. الرجاء المحاولة مجدداً.' });
  }
});

// === Integrate Vite Middleware in Development ===
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    try {
      let template = await vite.transformIndexHtml(url, `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>نبض | منصة التواصل الاجتماعي العصرية</title>
    <!-- Google Fonts for beautiful Arabic typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-slate-100 font-cairo antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  // Serve static assets from build in production
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
