"use client";
import { NewsArticle } from '@/entities/News/model/types';
import ModalOverlay from '@/shared/ModalOverlay/ui/ModalOverlay';
import ModalContent from '@/shared/ModalOverlayContent/ui/ModalOverlayContent';
import { useLayoutEffect, useState } from 'react';
import { get, set } from 'idb-keyval';
import MoodSelector from './MoodSelector';
import SourceLink from '@/shared/Link/ui/SourceLink';
import { moods } from '../model/types';
import ErrorModal from '@/shared/ErrorModal/ui/ErrorModal';

interface RewriteModalProps {
  article: NewsArticle;
  isOpen: boolean;
  onClose: () => void;
}

export const RewriteModal = ({ article, isOpen, onClose }: RewriteModalProps) => {
  const [cache, setCache] = useState<Record<string, string>>({});
  const [currentMood, setCurrentMood] = useState('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingDB, setIsCheckingDB] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const loadCacheFromDB = async () => {
      if (!isOpen) return;

      setIsCheckingDB(true);
      
      try {
        const moodsIds = moods.map(m => m.id);
        const cacheData: Record<string, string> = { neutral: "" };

        for (const mood of moodsIds) {
          const dbKey = `${article.url}_${mood}`;
          const cachedText = await get(dbKey);
          
          if (cachedText) {
            cacheData[mood] = cachedText;
          }
        }

        setCache(cacheData);
      } catch (e) {
        console.error('Ошибка чтения из IndexedDB', e);
      } finally {
        setIsCheckingDB(false);
      }
    };

    loadCacheFromDB();
  }, [article.url, article.fullText, isOpen]);

  if (!isOpen) return null;

  const handleMoodClick = async (mood: string) => {
    setCurrentMood(mood);

    if (cache[mood]) return;

    try {
      const dbKey = `${article.url}_${mood}`;
      const cachedText = await get(dbKey);
      
      if (cachedText) {
        setCache(prev => ({ ...prev, [mood]: cachedText }));
        return;
      }
    } catch (e) {
      setError('Ошибка при чтении из IndexedDB');
    }
  };

  const RewriteArticle = async (mood: string) => {
    setIsLoading(true);
    setCurrentMood(mood);

    try {
      const response = await fetch('/api/rewriteArticle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: article.fullText,
          mood: mood
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Ошибка при переписывании');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let rewrittenText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          rewrittenText += decoder.decode(value, { stream: true });
          setCache(prev => ({ ...prev, [mood]: rewrittenText }));
        }

        const dbKey = `${article.url}_${mood}`;
        await set(dbKey, rewrittenText);
      }
      
    } catch (error) {
      console.error('Ошибка:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при генерации текста');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalContent className="
        w-full 
        max-w-5xl 
        h-[95vh] sm:h-[90vh] md:h-[85vh] 
        p-3 sm:p-4 md:p-6 
        flex flex-col
        mx-2 sm:mx-4
      ">
        
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition shrink-0 text-sm sm:text-base"
        >
          ✕
        </button>

        <div className="border-b pb-3 sm:pb-4 mb-3 sm:mb-4 mt-1 sm:mt-2 text-center shrink-0">
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 px-2 sm:px-4 md:px-8 line-clamp-2 sm:line-clamp-3">
            {article.title}
          </h2>
          
          <MoodSelector 
            currentMood={currentMood} 
            onMoodSelect={handleMoodClick} 
            isDisabled={isLoading || isCheckingDB}
          />
        </div>
        
        <div className="
          grid 
          grid-cols-1           
          md:grid-cols-2        
          gap-3 sm:gap-4 md:gap-6 
          flex-1 
          min-h-0
        ">
          <div className="flex flex-col h-full min-h-0 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-500 mb-2 text-center shrink-0 text-sm sm:text-base">
              Оригинал
            </h3>
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 text-xs sm:text-sm whitespace-pre-wrap min-h-0">
              {article.fullText}
            </div>
          </div>
          
          <div className="flex flex-col h-full min-h-0 bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-200">
            <h3 className="font-bold text-indigo-500 mb-2 text-center shrink-0 text-sm sm:text-base">
              Версия ИИ
            </h3>
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 text-xs sm:text-sm whitespace-pre-wrap min-h-0">
              {(isLoading || isCheckingDB) && !cache[currentMood] ? (
                <div className="flex items-center justify-center h-full">
                  <span className="animate-pulse text-indigo-400">Нейросеть думает...</span>
                </div>
              ) : (
                cache[currentMood] ? (
                  <div className="flex flex-col h-full">
                    {/* Текст */}
                    <div className="flex-1 overflow-y-auto whitespace-pre-wrap">
                      {cache[currentMood]}
                    </div>
                    
                    <div className="flex justify-center mt-3 pt-3 border-t border-indigo-200/50 shrink-0">
                      <button 
                        className="
                          bg-indigo-100 
                          hover:bg-indigo-200 
                          text-indigo-700 
                          font-medium 
                          py-1.5 px-4 
                          rounded-lg 
                          transition-all 
                          duration-200
                          text-xs sm:text-sm
                          disabled:opacity-50 
                          disabled:cursor-not-allowed
                          hover:scale-[1.02]
                          active:scale-[0.98]
                        "
                        onClick={() => RewriteArticle(currentMood)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Переписываю...' : ' Переписать заново'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <button 
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 sm:px-5 rounded-lg transition-colors shadow-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => RewriteArticle(currentMood)}
                      disabled={isLoading}
                    >
                      Переписать
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="p-1 sm:p-2 mt-1">
          <SourceLink url={article.url}>
            Ссылка на источник
          </SourceLink>
        </div>
      </ModalContent>
      {error && (<ErrorModal message={error} onClose={() => setError(null)} />)}
    </ModalOverlay>
  );
};