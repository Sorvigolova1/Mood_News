'use server'
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { NewsArticle } from '../model/types';

const parser = new Parser();

export async function getFullArticleText(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        cookie: 'unity_pause_sso=1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        'accept-language': 'ru,en;q=0.9',
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    let text = '';
    $('.topic-body__content-text').each((_, el) => {
      const p = $(el).text().trim();
      if (p.length > 50) text += p + '\n\n';
    });

   if (!text) throw new Error('Пустой текст статьи');
return text;
} catch (e) {
  throw new Error('Не удалось загрузить текст статьи');
}
}
export async function getNews(): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL(process.env.PARSE_URL || 'https://lenta.ru/rss');
    const topItems = feed.items;
   
    
   const newsWithoutFullText = topItems.map((item) => {
      let imageUrl = item.enclosure?.url || '';

      if (imageUrl.includes('lenta_og')) {
        imageUrl = '';
      }
      
      return {
        title: item.title ?? 'Без заголовка',
        fullText: '', 
        imageUrl: imageUrl,
        url: item.link ?? '',
        source: 'Lenta.ru',
      };
    });

    return newsWithoutFullText  ;
  } catch (error) {
   throw new Error('Не удалось загрузить ленту новостей');
   return [];
  }
}