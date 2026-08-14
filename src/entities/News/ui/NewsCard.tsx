import { memo, useEffect } from "react";
import { NewsArticle } from "../model/types";

interface NewsProps {
  article: NewsArticle;
}


const NewsCard = ({ article }: NewsProps) => {
  
  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden flex flex-col h-full shadow-sm hover:translate-y-[-3px] hover:shadow-lg transition-transform duration-100">
      {article.imageUrl ? (
        <img 
          src={article.imageUrl} 
          alt={article.title} 
           onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          className="w-full h-48 object-cover border-b border-[var(--border)] hover:scale-105 transition-transform duration-200"
        />
      ) : (
        <div className="w-full h-48 bg-slate-100 border-b border-[var(--border)] flex items-center justify-center text-slate-400 text-sm">
          Нет изображения
        </div>
      )}

      <div className="p-6 flex flex-col gap-3 flex-grow">
        <div className="text-sm text-[var(--primary)] font-semibold">
          {article.source || "Lenta.ru"}
        </div>
        
        <h3 className="font-bold text-lg leading-snug">
          {article.title}
        </h3>
        
        
        <div className="mt-auto pt-3 text-xs font-medium text-[var(--text-muted)] opacity-70">
          Нажмите, чтобы открыть разные версии
        </div>
      </div>
      
    </div>
  );
}

export default memo(NewsCard);