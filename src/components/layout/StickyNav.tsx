'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, ChevronDown, Check, Search, X } from 'lucide-react';
import { categories } from '@/lib/mockData';
import { useI18n } from '@/lib/i18nContext';
import { cn } from '@/lib/utils';

interface StickyNavProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function StickyNav({ searchQuery = '', onSearchChange }: StickyNavProps) {
  const { locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || 'mini-maki');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const isUserClicking = useRef(false);

  // Відкриття та фокус на інпуті
  const toggleSearch = () => {
    setIsSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      return next;
    });
  };

  // Закриття пошуку при кліку поза ним, якщо поле пусте
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        if (!searchQuery) {
          setIsSearchOpen(false);
        }
      }
    };
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen, searchQuery]);

  // Закриття дропдауну при кліку поза ним або по клавіші Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const scrollToCategory = (categoryId: string) => {
    isUserClicking.current = true;
    setActiveCategory(categoryId);
    setIsDropdownOpen(false);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      // Вимірюємо точну сумарну висоту зафіксованих панелей (Header + StickyNav)
      const headerEl = document.querySelector('header') as HTMLElement | null;
      const stickyNavEl = document.querySelector('.sticky.z-30') as HTMLElement | null;
      const totalStickyHeight = (headerEl?.offsetHeight || 105) + (stickyNavEl?.offsetHeight || 56);
      
      // Додаємо 20px комфортного повітря над заголовком розділу
      const safetyMargin = 20;
      const totalOffset = totalStickyHeight + safetyMargin;

      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = Math.max(0, elementPosition - totalOffset);

      // Миттєвий чіткий перехід без прокрутки та смикання
      window.scrollTo({
        top: offsetPosition,
        behavior: 'instant',
      });
    }
    setTimeout(() => {
      isUserClicking.current = false;
    }, 200);
  };

  // Слухач скролу сторінки: визначає поточну категорію
  useEffect(() => {
    const handleScroll = () => {
      if (isUserClicking.current) return;
      const isDesktop = window.innerWidth >= 640;
      const scrollPosition = window.scrollY + (isDesktop ? 210 : 150);

      for (let i = categories.length - 1; i >= 0; i--) {
        const cat = categories[i];
        const el = document.getElementById(`category-${cat.id}`);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Коли пошуковий запит змінюється або скидається, одразу синхронізуємо активну категорію з реальною позицією на сторінці
  useEffect(() => {
    // Невеличкий таймаут, щоб DOM встиг оновитися після виходу з режиму фільтрації
    const timer = setTimeout(() => {
      const isDesktop = window.innerWidth >= 640;
      const scrollPosition = window.scrollY + (isDesktop ? 220 : 160);

      for (let i = categories.length - 1; i >= 0; i--) {
        const cat = categories[i];
        const el = document.getElementById(`category-${cat.id}`);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveCategory(cat.id);
            return;
          }
        }
      }
      // Якщо ми на самому початку або вище першої категорії — ставимо першу категорію
      if (categories[0]) {
        setActiveCategory(categories[0].id);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Обчислення циклічного списку: активний елемент завжди строго в центрі,
  // а попередні та наступні категорії безперервно зациклюються по колу
  const activeIndex = categories.findIndex((c) => c.id === activeCategory);
  const validIndex = activeIndex >= 0 ? activeIndex : 0;
  const total = categories.length;

  // Формуємо циклічний зріз: по 5 категорій ліворуч і по 5 праворуч від активної
  const halfRange = 5;
  const cyclicItems: { category: (typeof categories)[0]; offset: number }[] = [];
  for (let offset = -halfRange; offset <= halfRange; offset++) {
    const index = (validIndex + offset + total * 10) % total;
    cyclicItems.push({ category: categories[index], offset });
  }

  // При зміні активної категорії центруємо контейнер навігації (плавно під час скролу сторінки)
  useEffect(() => {
    if (navRef.current) {
      const centerBtn = navRef.current.querySelector<HTMLButtonElement>('[data-is-center="true"]');
      if (centerBtn) {
        const container = navRef.current;
        const left = centerBtn.offsetLeft - container.offsetWidth / 2 + centerBtn.offsetWidth / 2;
        // Якщо перехід викликано ручним кліком користувача — переходимо миттєво, а при звичайному скролі — плавно
        container.scrollTo({
          left,
          behavior: isUserClicking.current ? 'instant' : 'smooth',
        });
      }
    }
  }, [activeCategory]);

  const stepCategory = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (validIndex + 1) % total 
      : (validIndex - 1 + total) % total;
    scrollToCategory(categories[newIndex].id);
  };

  // Точне динамічне вимірювання висоти хедера для ідеального позиціонування sticky nav
  const [headerHeight, setHeaderHeight] = useState(105);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  return (
    <div
      style={{ top: `${headerHeight}px` }}
      className="sticky z-30 w-full bg-[#07070a]/95 backdrop-blur-xl border-b border-white/10 transition-all shadow-md shadow-black/40"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative flex items-center h-12 sm:h-14">
        {/* Кнопка випадаючого списку категорій: повноцінна стильна кнопка "Меню" */}
        <div className="relative shrink-0 z-20 flex items-center my-auto" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            title={locale === 'pl' ? 'Kategorie menu' : 'Категорії меню'}
            className={cn(
              'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold shrink-0 mr-2 sm:mr-3 transition-all duration-200 cursor-pointer shadow-sm group select-none',
              isDropdownOpen
                ? 'bg-[#e50914] text-white border border-[#e50914] shadow-lg shadow-[#e50914]/40 scale-[1.02]'
                : 'bg-[#18181f] hover:bg-[#22222b] text-white border border-white/20 hover:border-[#e50914]'
            )}
          >
            <LayoutGrid className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200', isDropdownOpen ? 'rotate-90 text-white' : 'text-[#e50914] group-hover:scale-110')} />
            <span className="tracking-wide">
              {locale === 'pl' ? 'Menu' : 'Меню'}
            </span>
            <ChevronDown className={cn('w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400 group-hover:text-white transition-transform duration-200', isDropdownOpen && 'rotate-180 text-white')} />
          </button>

          {/* Випадаючий акуратний список без окремого модального вікна */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 max-h-[75vh] overflow-y-auto rounded-2xl bg-[#0f0f14]/98 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl shadow-black/80 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-white/5 mb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {locale === 'pl' ? 'Wszystkie kategorie' : 'Усі категорії'}
                </span>
                <span className="text-[10px] font-medium text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                  {categories.length}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                {categories.map((cat) => {
                  const isActive = cat.id === activeCategory;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => scrollToCategory(cat.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer group',
                        isActive
                          ? 'bg-[#e50914] text-white shadow-sm shadow-[#e50914]/40 font-bold'
                          : 'text-zinc-300 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <span className="truncate">{cat.name[locale]}</span>
                      {isActive ? (
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[#e50914] transition-colors shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Розділювач */}
        <div className="h-5 w-[1px] bg-white/10 mr-1.5 sm:mr-2 shrink-0 hidden sm:block" />

        {/* Контейнер стрічки категорій зі своїми локальними градієнтними масками */}
        <div className="relative flex-1 min-w-0 flex items-center">
          {/* Кнопка скролу вліво (попередня категорія по колу) */}
          <button
            onClick={() => stepCategory('prev')}
            aria-label="Попередня категорія"
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-all mr-1 cursor-pointer shrink-0 z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* М'які градієнтні маски виключно над стрічкою категорій, які не налізають на кнопку Меню */}
          <div className="pointer-events-none absolute left-0 md:left-8 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-[#07070a] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 md:right-8 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-l from-[#07070a] to-transparent z-10" />

          {/* Циклічна нескінченна стрічка з активним розділом строго по центру */}
          <div
            ref={navRef}
            className="flex items-center gap-1 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 sm:py-2.5 w-full px-2"
            aria-label="Категорії меню"
          >
          {cyclicItems.map(({ category, offset }) => {
            const isCenter = offset === 0;
            return (
                <button
                  key={`${category.id}-${offset}`}
                  data-is-center={isCenter ? 'true' : 'false'}
                  onClick={() => scrollToCategory(category.id)}
                  className={cn(
                    'relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 ease-out cursor-pointer shrink-0 select-none',
                    isCenter
                      ? 'text-white scale-105'
                      : 'text-zinc-500 hover:text-zinc-300 opacity-60 hover:opacity-100 scale-100'
                  )}
                >
                  <span className="relative z-10 transition-colors duration-300">{category.name[locale]}</span>

                  {/* Неонова рубінова лінія підкреслення під центральним активним розділом з м'якою анімацією появи */}
                  <span
                    className={cn(
                      'absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full transition-all duration-300 ease-out',
                      isCenter
                        ? 'bg-gradient-to-r from-[#e50914] via-[#ff4d58] to-[#e50914] shadow-[0_0_12px_#e50914] opacity-100 scale-x-100'
                        : 'opacity-0 scale-x-50 pointer-events-none'
                    )}
                  />
                </button>
            );
          })}
        </div>

        {/* Кнопка скролу вправо (наступна категорія по колу) */}
        <button
          onClick={() => stepCategory('next')}
          aria-label="Наступна категорія"
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-all ml-1 cursor-pointer shrink-0 z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        </div>

        {/* Компактний пошук у стікі нав: завжди під рукою */}
        {onSearchChange && (
          <div className="relative shrink-0 ml-1.5 sm:ml-3 z-20 flex items-center" ref={searchBoxRef}>
            {isSearchOpen || searchQuery ? (
              <div className="relative flex items-center animate-in fade-in duration-200">
                <Search className="absolute left-2.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={locale === 'pl' ? 'Szukaj...' : 'Пошук...'}
                  className="w-36 sm:w-52 pl-8 pr-7 py-1.5 rounded-xl bg-[#13131a] border border-[#e50914]/60 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#e50914] shadow-md shadow-black/50"
                />
                {searchQuery ? (
                  <button
                    onClick={() => {
                      onSearchChange('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 text-zinc-400 hover:text-white text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-2 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={toggleSearch}
                aria-label="Пошук у меню"
                title={locale === 'pl' ? 'Szukaj w menu' : 'Пошук у меню'}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#18181f] hover:bg-[#22222b] text-zinc-300 hover:text-white border border-white/15 hover:border-[#e50914] transition-all cursor-pointer shadow-xs group"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e50914] group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
