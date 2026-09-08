import React, { useState } from 'react';
import { BookMarked, Bookmark, Lightbulb, Brain, ArrowRight, Sparkles, Feather } from 'lucide-react';

export default function BookCover({ 
  coverUrl, 
  title = 'Untitled Book', 
  author = 'Author', 
  category = 'General',
  bookId = '',
  className = 'w-full aspect-[2/3]'
}) {
  const [imgError, setImgError] = useState(!coverUrl);

  const t = (title || '').toLowerCase();

  // 1. Bespoke Editorial Hardcover Styles matching user reference media_1788624694712.jpg
  if (t.includes('psychology of money')) {
    return (
      <div className={`relative rounded-xl overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.09)] border border-[#E5E0D6] dark:border-[#2C313C] bg-[#FAF8F5] text-[#1A1A1A] flex flex-col justify-between p-3 select-none transition-transform duration-200 group-hover:-translate-y-1 ${className}`}>
        {/* Spine lighting */}
        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-2.5 w-px bg-white/40 pointer-events-none" />
        
        <div className="text-center pt-2">
          <p className="text-[8px] font-bold tracking-[0.2em] text-[#6B7280] uppercase">The International Bestseller</p>
          <h3 className="font-serif font-bold text-base sm:text-lg leading-tight mt-1 text-[#18181B]">
            The <br /><span className="text-xl sm:text-2xl italic font-normal">Psychology</span><br />of Money
          </h3>
        </div>

        <div className="my-auto flex justify-center py-2">
          <div className="w-14 h-14 rounded-full border border-[#D4CEBF] flex items-center justify-center text-[#374151] bg-[#F4EFE6]/50">
            <Brain className="w-7 h-7 stroke-[1.5]" />
          </div>
        </div>

        <div className="text-center pb-1 border-t border-[#EAE4D8] pt-2">
          <p className="text-[9px] font-bold tracking-wider uppercase text-[#1F2937]">Morgan Housel</p>
          <p className="text-[7px] text-[#9CA3AF] tracking-tighter">Timeless lessons on wealth & greed</p>
        </div>
      </div>
    );
  }

  if (t.includes('company of one')) {
    return (
      <div className={`relative rounded-xl overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.09)] border border-[#E5E0D6] dark:border-[#2C313C] bg-[#FFFFFF] text-[#1A1A1A] flex flex-col justify-between p-3 select-none transition-transform duration-200 group-hover:-translate-y-1 ${className}`}>
        {/* Spine lighting */}
        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-2.5 w-px bg-white/40 pointer-events-none" />

        <div className="pt-2">
          <h3 className="font-serif font-bold text-xl sm:text-2xl leading-none text-[#18181B] tracking-tight">
            Company
          </h3>
          <p className="font-serif italic text-base text-[#4B5563] -mt-0.5">of One</p>
        </div>

        <div className="my-auto flex flex-col items-center justify-center gap-1.5 py-3">
          <div className="w-8 h-8 rounded-full bg-[#FAF5EE] border border-[#EAE3D6] flex items-center justify-center text-[#E76F51]">
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </div>
          <p className="text-[8px] text-center text-[#6B7280] max-w-[90px] leading-tight font-medium">Why staying small is the next big thing</p>
        </div>

        <div className="pb-1 border-t border-[#F3EFE6] pt-2">
          <p className="text-[9px] font-bold tracking-wider uppercase text-[#1F2937]">Paul Jarvis</p>
        </div>
      </div>
    );
  }

  if (t.includes('innovation works')) {
    return (
      <div className={`relative rounded-xl overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.09)] border border-amber-300 dark:border-amber-600/50 bg-[#FACC15] text-[#1E1B4B] flex flex-col justify-between p-3 select-none transition-transform duration-200 group-hover:-translate-y-1 ${className}`}>
        {/* Spine lighting */}
        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/25 via-black/5 to-transparent pointer-events-none" />
        
        <div className="pt-1">
          <p className="font-bold text-[10px] tracking-wider uppercase text-[#1F2937]">Matt Ridley</p>
          <p className="text-[7px] text-[#4B5563] uppercase tracking-tighter">Bestselling Author</p>
        </div>

        <div className="my-auto text-center py-2">
          <div className="flex justify-center mb-1">
            <Lightbulb className="w-7 h-7 text-[#1E1B4B]" />
          </div>
          <h3 className="font-black text-lg sm:text-xl uppercase tracking-tighter leading-tight text-[#1E1B4B]">
            How <br />Innovation <br />Works
          </h3>
        </div>

        <div className="pb-1 pt-2 border-t border-amber-400/80">
          <p className="text-[8px] font-bold text-center text-[#374151]">And Why It Flourishes in Freedom</p>
        </div>
      </div>
    );
  }

  if (t.includes('dorian gray')) {
    return (
      <div className={`relative rounded-xl overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.18)] border border-stone-800 bg-[#121110] text-[#E8E2D5] flex flex-col justify-between p-3 select-none transition-transform duration-200 group-hover:-translate-y-1 ${className}`}>
        {/* Spine lighting */}
        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />

        <div className="text-center pt-2">
          <p className="text-[8px] font-serif tracking-[0.2em] text-[#C4B59D] uppercase">Classic Literature</p>
        </div>

        <div className="my-auto text-center border-y border-[#3A352F] py-3 my-2">
          <h3 className="font-serif font-bold text-lg sm:text-xl leading-tight text-[#FAF5EB] tracking-wide">
            The Picture of <br />
            <span className="italic font-normal">Dorian Gray</span>
          </h3>
        </div>

        <div className="text-center pb-1">
          <p className="font-serif text-[10px] tracking-widest uppercase text-[#D4C3A3]">Oscar Wilde</p>
        </div>
      </div>
    );
  }

  // 2. Direct cover image rendering with strict containment
  if (coverUrl && !imgError) {
    return (
      <div className={`relative rounded-xl overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.08)] border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 transition-transform duration-200 group-hover:-translate-y-1 ${className}`}>
        <img
          src={coverUrl}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Book spine lighting crease */}
        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/35 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 left-2.5 w-px bg-white/20 pointer-events-none" />
      </div>
    );
  }

  // 3. Procedural Hardcover Book Jacket for other catalog titles
  const getTheme = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('comp') || c.includes('code') || c.includes('software')) {
      return {
        bg: 'from-[#1E293B] via-[#0F172A] to-[#020617]',
        border: 'border-slate-700',
        ribbon: 'text-sky-300',
        accent: 'text-sky-400'
      };
    }
    if (c.includes('engin') || c.includes('arch')) {
      return {
        bg: 'from-[#193B2D] via-[#122B21] to-[#0A1B14]',
        border: 'border-emerald-900',
        ribbon: 'text-emerald-300',
        accent: 'text-emerald-400'
      };
    }
    if (c.includes('ai') || c.includes('deep') || c.includes('learn')) {
      return {
        bg: 'from-[#3B1D54] via-[#241038] to-[#12071E]',
        border: 'border-purple-900',
        ribbon: 'text-purple-300',
        accent: 'text-purple-400'
      };
    }
    if (c.includes('math') || c.includes('algor')) {
      return {
        bg: 'from-[#7C2D12] via-[#431407] to-[#1C0502]',
        border: 'border-amber-900',
        ribbon: 'text-amber-300',
        accent: 'text-amber-400'
      };
    }
    return {
      bg: 'from-[#292524] via-[#1C1917] to-[#0C0A09]',
      border: 'border-stone-700',
      ribbon: 'text-stone-300',
      accent: 'text-stone-400'
    };
  };

  const theme = getTheme(category);

  return (
    <div 
      className={`relative rounded-xl overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.12)] border ${theme.border} bg-gradient-to-br ${theme.bg} text-white p-3 flex flex-col justify-between select-none transition-transform duration-200 group-hover:-translate-y-1 ${className}`}
    >
      {/* Book spine lighting crease */}
      <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-2.5 w-[1px] bg-white/10 pointer-events-none" />

      {/* Book Top Ribbon / Category */}
      <div className="flex items-center justify-between text-[8px] font-mono tracking-wider opacity-85 pl-1.5">
        <span className={`uppercase font-bold ${theme.ribbon}`}>{category.slice(0, 14)}</span>
        <Bookmark className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
      </div>

      {/* Book Title & Author */}
      <div className="my-auto pl-1.5 pr-0.5 py-2">
        <h4 className="font-serif font-bold text-xs sm:text-sm leading-snug line-clamp-3 text-stone-100 drop-shadow-sm">
          {title}
        </h4>
        <p className="text-[9px] text-stone-300 mt-1.5 truncate font-medium">
          {author}
        </p>
      </div>

      {/* Book ID Stamping */}
      {bookId && (
        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[8px] font-mono pl-1.5 opacity-90">
          <span className="text-amber-200 font-bold">{bookId}</span>
          <BookMarked className="w-2.5 h-2.5 opacity-60" />
        </div>
      )}
    </div>
  );
}
