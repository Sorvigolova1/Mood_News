import { streamText } from 'ai'; 
import { createDeepSeek } from '@ai-sdk/deepseek';
import { NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "Введите API ключь";

const deepseek = createDeepSeek({
  apiKey: DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, mood } = await req.json();

    if (DEEPSEEK_API_KEY === "Введите API ключь" || !DEEPSEEK_API_KEY) {
      throw new Error('Нет API ключа DeepSeek');
    }

    if (!text || !mood) {
      throw new Error('Не передан текст или настроение');
    }

    const moodMap: Record<string, string> = {
      neutral: 'нейтральном, объективном, без эмоциональной окраски',
      happy: 'позитивном, оптимистичном, воодушевляющем, с акцентом на хорошие новости и достижения',
      sad: 'меланхоличном, задумчивом, с акцентом на потери и трудности, можешь очень драматизировать',
      anger: 'критическом, жёстком, с акцентом на несправедливость и нарушения, с агрессией,можешь писать большими буквами',
    };

    const moodDescription = moodMap[mood] || moodMap.neutral;

    const prompt = `Твоя задача — переписать текст в ${moodDescription} тоне.

ВАЖНО: Ты ДОЛЖЕН сохранить ВСЕ факты без изменений:
- Имена людей и организаций
- Даты и время
- Числа, суммы, проценты
- Географические названия
- Прямые цитаты
- Статистические данные

Ты можешь менять:
- Эмоциональную окраску предложений
- Стиль изложения (более живой или более сдержанный)
- Лексику (подбирать слова под нужный тон)
- Порядок предложений (если это улучшает восприятие)

ЗАПРЕЩЕНО:
- Добавлять новые факты или информацию
- Удалять существующие факты
- Использовать смайлики и эмодзи
- Добавлять вступления, выводы или комментарии от себя
- Изменять прямые цитаты
- Искажать числовые данные

Текст для переписывания:
${text}

Перепиши текст в заданном тоне. Выведи ТОЛЬКО переписанный текст, без пояснений и вступлений.

Переписанный текст:`;
    
    const result = streamText({
      model: deepseek('deepseek-chat'),
      prompt: prompt,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const textChunk of result.textStream) {
            controller.enqueue(encoder.encode(textChunk));
          }
        } catch (streamError) {
          console.error("Ошибка внутри потока:", streamError);
          throw streamError;
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8', 
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("Ошибка API DeepSeek:", error);
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' }, 
      { status: error.status || 500 }
    );
  }
}