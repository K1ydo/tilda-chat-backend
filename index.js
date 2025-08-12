// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Нет сообщения' });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // или 'gpt-4o-mini' если есть доступ
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
