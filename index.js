require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'https://экстраспа.рф',
  'https://xn--80aa2avdfcf0h.xn--p1ai', // на всякий случай
  'https://www.экстраспа.рф',
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin || allowedOrigins.indexOf(origin) !== -1){
      callback(null, true);
    } else {
      callback(new Error('CORS не разрешён для этого источника'));
    }
  }
}));

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Локальный FAQ массив ---
const faqData = [
  {
    keys: ['филиал', 'адрес', 'салон', 'где находит', 'где находится'],
    answer: `
Extra СПА — сеть из 4 салонов в Санкт-Петербурге:

1) Типанова, ул.Типанова д.21, ТК "Питер"
Пн.- Пт. 10:00-22:00, Сб.- Вс. 10:00-22:00

2) De-vision, пр.Культуры д.1, ТРК "Родео Драйв"
Пн.- Пт. 10:00-22:00, Сб.- Вс. 10:00-22:00

3) Южный полюс, пр. Славы, 50/48
Пн.- Пт. 10:00-22:00, Сб.- Вс. 10:00-22:00

4) Гранд Каньон, пр. Энгельса, 154
Пн.- Пт. 10:00-22:00, Сб.- Вс. 10:00-22:00

WhatsApp: +7 999-514-61-93
Телефон: +7 923-899-02-30
Телеграм: https://t.me/extraspa
Онлайн запись: https://dikidi.net/g291792
`
  },

  {
    keys: ['программы для одного', 'программы для 1', 'программа один', 'программа для одного'],
    answer: `https://экстраспа.рф/spaforone

(Тут добавь полный текст программ для одного из твоего документа)
`
  },

  // Добавь остальные вопросы-ответы в таком же формате
];

// Функция поиска локального ответа по ключу
function findFaqAnswer(message) {
  const text = message.toLowerCase();
  for (const faq of faqData) {
    for (const key of faq.keys) {
      if (text.includes(key)) {
        return faq.answer.trim();
      }
    }
  }
  return null;
}

// Маршрут /chat
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Нет сообщения' });

    // Сначала ищем локальный ответ
    const localAnswer = findFaqAnswer(message);
    if (localAnswer) {
      return res.json({ answer: localAnswer });
    }

    // Если нет локального — вызываем OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ты — виртуальный ассистент сайта https://экстраспа.рф/. Отвечай только на вопросы про спа-услуги.'
        },
        { role: 'user', content: message }
      ],
    });

    res.json({ answer: completion.choices[0].message.content.trim() });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
