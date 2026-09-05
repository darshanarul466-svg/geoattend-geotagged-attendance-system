import React, { useState } from 'react';
import { BookMarked, Bookmark } from 'lucide-react';

export default function BookCover({ 
  coverUrl, 
  title = 'Untitled Book', 
  author = 'Author', 
  category = 'General',
  bookId = '',
  className = 'w-16 h-22'
}) {
  const [imgError, setImgError] = useState(!coverUrl);

  // Palette generator based on category
  const getCategoryTheme = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('comp') || c.includes('code') || c.includes('software')) {
      return {
        bg: 'from-blue-700 via-indigo-800 to-slate-900',
        accent: 'border-blue-400/40 text-blue-300',
        badge: 'bg-blue-900/80 text-blue-200'
      };
    }
    if (c.includes('engin') || c.includes('arch') || c.includes('data-int')) {
      return {
        bg: 'from-emerald-700 via-teal-800 to-slate-900',
        accent: 'border-emerald-400/40 text-emerald-300',
        badge: 'bg-emerald-900/80 text-emerald-200'
      };
    }
    if (c.includes('ai') || c.includes('deep') || c.includes('learn')) {
      return {
        bg: 'from-purple-700 via-indigo-900 to-slate-950',
        accent: 'border-purple-400/40 text-purple-300',
        badge: 'bg-purple-900/80 text-purple-200'
      };
    }
    if (c.includes('math') || c.includes('algor')) {
      return {
        bg: 'from-amber-700 via-orange-800 to-slate-900',
        accent: 'border-amber-400/40 text-amber-300',
        badge: 'bg-amber-900/80 text-amber-200'
      };
    }
    if (c.includes('fiction') || c.includes('lit')) {
      return {
        bg: 'from-rose-700 via-pink-900 to-slate-950',
        accent: 'border-rose-400/40 text-rose-300',
        badge: 'bg-rose-900/80 text-rose-200'
      };
    }
    return {
      bg: 'from-slate-700 via-slate-800 to-slate-950',
      accent: 'border-slate-400/40 text-slate-300',
      badge: 'bg-slate-800 text-slate-200'
    };
  };

  const theme = getCategoryTheme(category);

  if (coverUrl && !imgError) {
    return (
      <div className={`relative rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700/80 shrink-0 bg-slate-100 dark:bg-slate-800 ${className}`}>
        <img
          src={coverUrl}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Subtle spine shadow on the left edge for realistic hardcover book look */}
        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
      </div>
    );
  }

  // Fallback: Richly styled Hardcover Book Jacket
  return (
    <div 
      className={`relative rounded-xl overflow-hidden shadow-md border border-slate-700/40 shrink-0 bg-gradient-to-br ${theme.bg} text-white p-2 flex flex-col justify-between select-none ${className}`}
    >
      {/* Book spine lighting crease */}
      <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-2.5 w-[1px] bg-white/10 pointer-events-none" />

      {/* Book Top Ribbon / Tag */}
      <div className="flex items-center justify-between text-[9px] font-mono tracking-tighter opacity-80 pl-1">
        <span className="truncate max-w-[80px] uppercase">{category.slice(0, 10)}</span>
        <Bookmark className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
      </div>

      {/* Book Title & Author */}
      <div className="my-auto pl-1 pr-0.5">
        <h5 className="font-extrabold text-[10px] leading-tight line-clamp-3 text-slate-50 drop-shadow-sm font-serif">
          {title}
        </h5>
        <p className="text-[8px] text-slate-300 mt-1 truncate font-medium">
          {author}
        </p>
      </div>

      {/* Book ID Foil Stamping */}
      {bookId && (
        <div className="pt-1 border-t border-white/15 flex items-center justify-between text-[8px] font-mono opacity-90 pl-1">
          <span className="text-amber-200 font-bold">{bookId}</span>
          <BookMarked className="w-2.5 h-2.5 opacity-60" />
        </div>
      )}
    </div>
  );
}
