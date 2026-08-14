import { get, set } from 'idb-keyval';
import { NewsArticle } from '@/entities/News/model/types';
import { getNews, getFullArticleText } from '@/entities/News/lib/getNews';

const NEWS_CACHE_KEY = 'cached_news_data';
const LAST_FETCH_TIME_KEY = 'cached_news_last_fetch';

export const SYNC_INTERVAL = 15* 60 * 1000; //15 минут

export async function getLocalNews(): Promise<NewsArticle[] | null> {
  const cached = await get<NewsArticle[]>(NEWS_CACHE_KEY);
  return cached || null;
}

export async function saveLocalNews(news: NewsArticle[]): Promise<void> {
  if (news && news.length > 0) {
    await Promise.all([
      set(NEWS_CACHE_KEY, news),
      set(LAST_FETCH_TIME_KEY, Date.now()),
    ]);
  }
}

export async function fetchAndSaveNews(): Promise<NewsArticle[]> {
  const freshNews = (await getNews()) as NewsArticle[];
  await saveLocalNews(freshNews);
  return freshNews;
}

export async function isCacheExpired(): Promise<boolean> {
  const lastFetch = await get<number>(LAST_FETCH_TIME_KEY);
  if (!lastFetch) return true;
  return Date.now() - lastFetch > SYNC_INTERVAL;
}

export async function getOrFetchArticleText(url: string): Promise<string> {
  const cacheKey = `article_fulltext_${url}`;
  const cachedText = await get<string>(cacheKey);

  if (cachedText) return cachedText;

  const freshText = await getFullArticleText(url);
  if (!freshText) throw new Error('Не удалось загрузить текст');

  await set(cacheKey, freshText);
  return freshText;
}