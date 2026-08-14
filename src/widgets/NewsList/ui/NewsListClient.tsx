'use client';

import { useEffect, useRef, useState } from 'react';
import { NewsArticle } from '@/entities/News/model/types';
import NewsCard from '@/entities/News/ui/NewsCard';
import { RewriteModal } from '@/features/RewriteNews/ui/RewriteModal';
import Loader from '@/shared/Loader/ui/Loader';
import { fetchAndSaveNews, getLocalNews, getOrFetchArticleText, isCacheExpired, saveLocalNews, SYNC_INTERVAL } from '@/entities/News/lib/newsStorage';
import ErrorModal from '@/shared/ErrorModal/ui/ErrorModal';

const LIMIT = parseInt(process.env.NEXT_PUBLIC_LIMIT || '12', 10);

interface NewsListClientProps {
  news?: NewsArticle[];
}

const NewsListClient = ({ news }: NewsListClientProps) => {
  const [articles, setArticles] = useState<NewsArticle[]>(news || []);
  const [error, setError] = useState<string | null>("");
  const [visibleCount, setVisibleCount] = useState(LIMIT);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [isArticleLoading, setIsArticleLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const syncArticles = async (force = false) => {
    try {
      const cachedNews = await getLocalNews();
      if (cachedNews && cachedNews.length > 0) {
        setArticles(cachedNews);
      }

      const expired = await isCacheExpired();

      if (expired || force || !cachedNews) {
        if (!cachedNews || cachedNews.length === 0) setLoading(true);

        const freshData = await fetchAndSaveNews();
        if (freshData && freshData.length > 0) {
          setArticles(freshData);
        }
      }
    } catch (e) {
    setError(e instanceof Error ? e.message : 'Ошибка загрузки');  
  } finally {
    setIsArticleLoading(false);
  }
  };

  useEffect(() => {
    if (news && news.length > 0) {
      saveLocalNews(news);
    } else {
      syncArticles();
    }

    const intervalId = setInterval(() => {
      syncArticles(true);
    }, SYNC_INTERVAL);

    return () => clearInterval(intervalId);
  }, [news]);

  const hasMore = articles.length > 0 && visibleCount < articles.length;

  useEffect(() => {
    const target = observerRef.current;
    const root = scrollContainerRef.current;

    if (!target || !root || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LIMIT, articles.length));
        }
      },
      {
        root,
        rootMargin: '120px',
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [hasMore, loading, articles.length]);

  const handleCardClick = async (article: Omit<NewsArticle, 'fullText'>) => {
    setIsArticleLoading(true);
    try {
      const text = await getOrFetchArticleText(article.url);
      setSelectedArticle({ ...article, fullText: text });
    } catch (error) {
      console.error('Ошибка загрузки текста статьи:', error);
    } finally {
      setIsArticleLoading(false);
    }
  };

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <div
      ref={scrollContainerRef}
      className="
        h-[calc(100dvh-2rem)] 
        w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] 
        overflow-y-scroll overflow-x-hidden 
        mx-auto pb-6 
        px-2 sm:px-4 md:px-6
      "
    >
      <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        md:grid-cols-2 
        lg:grid-cols-3 
        gap-3 sm:gap-4 md:gap-5
      ">
        {visibleArticles.map((article) => (
          <div
            key={article.url}
            onClick={() => handleCardClick(article)}
            className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <NewsCard article={article} />
          </div>
        ))}
      </div>

      {hasMore && !loading && (
        <div ref={observerRef} className="h-10 w-full" />
      )}

      {(loading || isArticleLoading) && (
        <div className="my-6 flex justify-center">
          <Loader />
        </div>
      )}

      {selectedArticle && (
        <RewriteModal
          isOpen={!!selectedArticle}
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </div>
  );
};

export default NewsListClient;