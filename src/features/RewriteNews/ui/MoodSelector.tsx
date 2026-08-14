"use client";

import { moods } from "../model/types";

interface MoodSelectorProps {
  currentMood: string;
  onMoodSelect: (mood: string) => void;
  isDisabled?: boolean;
}



const MoodSelector = ({ currentMood, onMoodSelect, isDisabled }: MoodSelectorProps) => {
  return (
    <div className="flex justify-center w-full sm:justify-start">
      <div className="
        grid 
        grid-cols-2 
        sm:inline-flex 
        sm:flex-wrap
        items-center 
        gap-1.5 sm:gap-2 
        bg-slate-100 
        rounded-xl sm:rounded-full 
        p-1.5 sm:p-1
        w-full sm:w-auto
        max-w-[320px] sm:max-w-none
        mx-auto sm:mx-0
      ">
        {moods.map((mood) => {
          const isActive = currentMood === mood.id;
          return (
            <button
              disabled={isDisabled}
              key={mood.id}
              onClick={() => onMoodSelect(mood.id)}
              className={`
                flex items-center justify-center gap-1.5 
                px-3 sm:px-4 
                py-2 sm:py-1.5 
                rounded-lg sm:rounded-full 
                transition-all duration-200 
                text-sm font-medium 
                whitespace-nowrap
                w-full sm:w-auto
                ${isActive 
                  ? 'bg-[var(--bg-color)] text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="text-base sm:text-base">{mood.emoji}</span>
              <span className="text-xs sm:text-sm">{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;