'use client';

import React from 'react';
import { useI18n } from '@/lib/i18nContext';

export function HeroBanner() {
  const { locale } = useI18n();

  const scrollToMenu = () => {
    const el = document.getElementById('category-mini-maki') || document.querySelector('section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden min-h-[500px] sm:min-h-[560px] flex flex-col justify-between border-b border-white/10 pt-12 sm:pt-16 pb-8 sm:pb-10">
      {/* Фонове атмосферне зображення зі свіжими суші-ролами */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero_sushi_bg.jpg"
          alt="Najlepsze Sushi w Świdnicy"
          className="w-full h-full object-cover object-left sm:object-center"
        />
        {/* Збалансоване затемнення: м'яка радіальна та вертикальна віньєтка, що забезпечує ідеальну контрастність тексту по центру */}
        <div className="absolute inset-0 bg-[#09090b]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-[#09090b]/60 to-[#09090b]/85" />
      </div>

      {/* Верхня частина з заголовком — відцентрована */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-4 sm:pt-6">
        <div className="max-w-5xl mx-auto text-center px-2">
          {/* Акцентований заголовок у гармонійному теплому шовковому кольорі слонової кістки / шампань */}
          <h1 
            style={{ fontFamily: 'var(--font-syne), "Syne", sans-serif' }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#fdf8f4] tracking-tight leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] max-w-full break-words"
          >
            {locale === 'pl' ? 'Najlepsze Sushi w Świdnicy' : 'Найкращі Суші у Свідниці'}
          </h1>
        </div>
      </div>

      {/* Середня частина: Акцентна кнопка зі скошеними кутами (самурайський меч / катана стиль) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto py-8 sm:py-12">
        <div className="flex items-center justify-center">
          <button
            onClick={scrollToMenu}
            className="animate-auto-pulse group relative inline-flex items-center justify-center p-[2px] sm:p-[2.5px] hover:scale-105 active:scale-95 cursor-pointer transition-transform duration-300 drop-shadow-[0_0_20px_rgba(229,9,20,0.35)]"
            style={{
              clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
            }}
          >
            {/* Обертовий яскравий світлячок по скошеному контуру */}
            <span 
              className="absolute w-[350%] h-[350%] -top-[125%] -left-[125%]"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 240deg, #e50914 290deg, #ff4d58 330deg, #ffffff 360deg)',
                animation: 'spinBeam 2.4s linear infinite',
              }}
            />

            {/* Внутрішнє тіло кнопки зі скошеними кутами */}
            <span 
              className="relative flex items-center justify-center gap-2.5 px-10 sm:px-14 py-3.5 sm:py-4.5 bg-[#0a0a0f] group-hover:bg-[#12121c] transition-colors duration-300 w-full h-full"
              style={{
                clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)',
              }}
            >
              <span className="text-xs sm:text-base font-black tracking-[0.25em] uppercase text-white select-none">
                {locale === 'pl' ? 'Wybierz rolki' : 'Обрати роли'}
              </span>
              <span className="text-[#e50914] text-sm sm:text-base font-bold group-hover:translate-x-1 transition-transform">
                ›
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Нижня частина: плашки промоцій. На мобільних — без рамок і фону, 3 елементи в рядок: кружечок + текст поруч; повний оригінальний текст */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative z-10 w-full mt-6 sm:mt-16">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4 w-full">
          {/* 10% З нагоди дня народження */}
          <div className="flex flex-row items-center text-left gap-2 sm:gap-3.5 p-0 bg-transparent">
            <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-[#e50914] text-white flex flex-col items-center justify-center font-black leading-none shrink-0 shadow-md shadow-[#e50914]/35">
              <span className="text-[10px] sm:text-sm font-black">10%</span>
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-sm font-bold text-white uppercase tracking-wider leading-tight">
                {locale === 'pl' ? 'Z okazji urodzin' : 'З нагоди дня народження'}
              </div>
              <div className="text-[7.5px] sm:text-[11px] text-zinc-400 sm:text-zinc-300/90 leading-tight mt-0.5">
                {locale === 'pl' ? '*Nie łączy się z innymi rabatami' : '*Не сумується з іншими знижками'}
              </div>
            </div>
          </div>

          {/* 5% Самовивіз */}
          <div className="flex flex-row items-center text-left gap-2 sm:gap-3.5 p-0 bg-transparent">
            <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-[#b80710] text-white flex flex-col items-center justify-center font-black leading-none shrink-0 shadow-md shadow-[#b80710]/35">
              <span className="text-[10px] sm:text-sm font-black">5%</span>
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-sm font-bold text-white uppercase tracking-wider leading-tight">
                {locale === 'pl' ? 'Odbiór własny' : 'Самовивіз із закладу'}
              </div>
              <div className="text-[7.5px] sm:text-[11px] text-zinc-400 sm:text-zinc-300/90 leading-tight mt-0.5">
                {locale === 'pl' ? 'Rabat przy odbiorze' : 'Знижка на все замовлення'}
              </div>
            </div>
          </div>

          {/* Безкоштовна доставка */}
          <div className="flex flex-row items-center text-left gap-2 sm:gap-3.5 p-0 bg-transparent">
            <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-[#e50914] text-white flex flex-col items-center justify-center font-black leading-none shrink-0 shadow-md shadow-[#e50914]/35">
              <span className="text-[8px] sm:text-xs font-black tracking-tight">0 ZŁ</span>
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-sm font-bold text-white uppercase tracking-wider leading-tight">
                {locale === 'pl' ? 'Darmowa dostawa' : 'Безкоштовна доставка'}
              </div>
              <div className="text-[7.5px] sm:text-[11px] text-zinc-400 sm:text-zinc-300/90 leading-tight mt-0.5">
                {locale === 'pl' ? 'Przy zamówieniu powyżej 100 zł' : 'При замовленні від 100 zł'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
