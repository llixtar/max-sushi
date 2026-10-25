'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categories, products } from '@/lib/mockData';
import { StickyNav } from '@/components/layout/StickyNav';
import { useI18n } from '@/lib/i18nContext';
import { ProductCard } from '@/components/menu/ProductCard';
import { CategorySection } from '@/components/menu/CategorySection';

export function MenuCatalog() {
  const { locale } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || 'mini-maki');
  const [isAllCategories, setIsAllCategories] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const catalogContentRef = useRef<HTMLDivElement>(null);

  // Знаходимо поточну категорію та сусідні для кнопок "Попередня / Наступна"
  const currentIndex = categories.findIndex((c) => c.id === selectedCategory);
  const activeCategoryObj = categories[currentIndex] || categories[0];
  const prevCategory = currentIndex > 0 ? categories[currentIndex - 1] : null;
  const nextCategory = currentIndex < categories.length - 1 ? categories[currentIndex + 1] : null;

  const scrollToCatalogTop = useCallback(() => {
    if (catalogContentRef.current) {
      const headerEl = document.querySelector('header') as HTMLElement | null;
      const stickyNavEl = document.querySelector('.sticky.z-30') as HTMLElement | null;
      const totalStickyHeight = (headerEl?.offsetHeight || 105) + (stickyNavEl?.offsetHeight || 56);
      
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = catalogContentRef.current.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const targetPosition = Math.max(0, elementPosition - totalStickyHeight - 16);

      window.scrollTo({
        top: targetPosition,
        behavior: 'instant',
      });
    }
  }, []);

  const handleSelectCategory = useCallback((catId: string) => {
    setIsAllCategories(false);
    setSelectedCategory(catId);
    setSearchQuery('');
    setTimeout(() => {
      scrollToCatalogTop();
    }, 50);
  }, [scrollToCatalogTop]);

  const handleShowAll = useCallback(() => {
    setIsAllCategories(true);
    setSearchQuery('');
    setTimeout(() => {
      scrollToCatalogTop();
    }, 50);
  }, [scrollToCatalogTop]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);

    // Якщо користувач почав вводити пошуковий запит, миттєво піднімаємо до початку результатів пошуку
    if (query.trim()) {
      scrollToCatalogTop();
    }
  }, [scrollToCatalogTop]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name[locale].toLowerCase().includes(query);
        const descMatch = p.description[locale].toLowerCase().includes(query);
        const ingMatch = p.ingredients[locale].some((ing) => ing.toLowerCase().includes(query));
        return nameMatch || descMatch || ingMatch;
      });
    }

    return result;
  }, [searchQuery, locale]);

  const isFiltering = searchQuery.trim().length > 0;
  const currentCategoryProducts = useMemo(() => {
    return products.filter((p) => p.categoryId === selectedCategory);
  }, [selectedCategory]);

  return (
    <div>
      {/* Навігація категорій з інтегрованим компактним пошуком та синхронізованим вибором розділу */}
      <StickyNav
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      <div ref={catalogContentRef} id="catalog-active-category" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Результати фільтрації або сторінка поточної вибраної категорії або повне меню */}
        {isFiltering ? (
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">
                {locale === 'pl' ? 'Wyniki wyszukiwania' : 'Результати пошуку'}
              </h3>
              <span className="text-xs text-zinc-400">
                {locale === 'pl' ? `Znaleziono: ${filteredProducts.length}` : `Знайдено: ${filteredProducts.length}`}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <p className="text-base font-semibold">
                  {locale === 'pl' ? 'Nic nie znaleziono dla podanego zapytania' : 'Нічого не знайдено за вашим запитом'}
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                >
                  {locale === 'pl' ? 'Wyczyść wyszukiwanie' : 'Скинути пошук'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ) : isAllCategories ? (
          <div>
            <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e50914] shadow-sm shadow-[#e50914]" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wider text-white">
                  {locale === 'pl' ? 'Pełne menu' : 'Повне меню закладу'}
                </h2>
              </div>

              <button
                onClick={() => handleSelectCategory(categories[0]?.id || 'mini-maki')}
                className="text-xs font-bold text-zinc-400 hover:text-white bg-[#16161f] hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                {locale === 'pl' ? '← Widok po kategoriach' : '← По категоріях'}
              </button>
            </div>

            {categories.map((category) => {
              const categoryProducts = products.filter(
                (p) => p.categoryId === category.id
              );
              return (
                <div key={category.id} id={`category-${category.id}`}>
                  <CategorySection
                    category={category}
                    products={categoryProducts}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {/* Заголовок поточної активної категорії */}
            <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#e50914] shadow-sm shadow-[#e50914]" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wider text-white">
                  {activeCategoryObj?.name[locale]}
                </h2>
              </div>

              <span className="text-xs font-bold text-zinc-400 bg-[#16161f] border border-white/10 px-3 py-1 rounded-xl shrink-0">
                {currentCategoryProducts.length} {locale === 'pl' ? 'pozycji' : 'позицій'}
              </span>
            </div>

            {/* Сітка товарів: 4 колонки на великих екранах, 3 на лептопах, 2 на планшетах, 1 на смартфонах */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {currentCategoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Блок переходу: Спочатку кнопка "Подивитися все меню" у формі клинка, а під нею номери сторінок */}
            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col items-center gap-5">
              {/* Кнопка "Подивитися все меню" разом у формі клинка (як у Hero) */}
              <button
                onClick={handleShowAll}
                style={{
                  clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
                }}
                className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-[#13131b] hover:bg-[#1a1a26] border border-white/15 hover:border-[#e50914] text-xs sm:text-sm font-black text-white uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg hover:shadow-[#e50914]/20 active:scale-95 select-none"
              >
                <span>{locale === 'pl' ? 'ZOBACZ CAŁE MENU' : 'ПЕРЕГЛЯНУТИ ВСЕ МЕНЮ'}</span>
              </button>

              {/* Мінімалістична пагінація сторінок категорій < 1 2 3 ... N > */}
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 pt-1">
                {/* Стрілочка назад < */}
                <button
                  onClick={() => prevCategory && handleSelectCategory(prevCategory.id)}
                  disabled={!prevCategory}
                  aria-label="Попередня категорія"
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer select-none"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Номери сторінок категорій */}
                {categories.map((cat, idx) => {
                  const pageNum = idx + 1;
                  const isActive = cat.id === selectedCategory;
                  const totalPages = categories.length;

                  // Показуємо першу, останню, поточну та сусідні навколо поточної
                  const showPage =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - (currentIndex + 1)) <= 1;

                  if (!showPage) {
                    // Виводимо крапки "..." лише один раз для пропущених діапазонів
                    if (pageNum === 2 && currentIndex + 1 > 3) {
                      return (
                        <span key={`dots-${pageNum}`} className="w-5 sm:w-6 text-center text-zinc-600 font-bold select-none text-xs sm:text-sm">
                          ...
                        </span>
                      );
                    }
                    if (pageNum === totalPages - 1 && currentIndex + 1 < totalPages - 2) {
                      return (
                        <span key={`dots-${pageNum}`} className="w-5 sm:w-6 text-center text-zinc-600 font-bold select-none text-xs sm:text-sm">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      aria-label={cat.name[locale]}
                      title={cat.name[locale]}
                      className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                        isActive
                          ? 'text-white bg-[#e50914]/20 border border-[#e50914]/50 shadow-sm shadow-[#e50914]/20 font-black'
                          : 'text-zinc-500 hover:text-zinc-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Стрілочка вперед > */}
                <button
                  onClick={() => nextCategory && handleSelectCategory(nextCategory.id)}
                  disabled={!nextCategory}
                  aria-label="Наступна категорія"
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer select-none"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
