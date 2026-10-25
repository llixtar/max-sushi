'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { categories, products } from '@/lib/mockData';
import { CategorySection } from '@/components/menu/CategorySection';
import { StickyNav } from '@/components/layout/StickyNav';
import { useI18n } from '@/lib/i18nContext';
import { ProductCard } from '@/components/menu/ProductCard';

export function MenuCatalog() {
  const { locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const catalogContentRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);

    // Якщо користувач почав вводити пошуковий запит, миттєво піднімаємо до початку результатів пошуку
    if (query.trim() && catalogContentRef.current) {
      const headerEl = document.querySelector('header') as HTMLElement | null;
      const stickyNavEl = document.querySelector('.sticky.z-30') as HTMLElement | null;
      const totalStickyHeight = (headerEl?.offsetHeight || 105) + (stickyNavEl?.offsetHeight || 56);
      
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = catalogContentRef.current.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const targetPosition = Math.max(0, elementPosition - totalStickyHeight - 16);

      // Якщо користувач знаходиться нижче за початок каталогу — переносимо нагору до результатів
      if (window.scrollY > targetPosition) {
        window.scrollTo({
          top: targetPosition,
          behavior: 'instant',
        });
      }
    }
  }, []);

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

  return (
    <div>
      {/* Навігація категорій з інтегрованим компактним пошуком */}
      <StickyNav searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <div ref={catalogContentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Результати фільтрації або стандартне меню за категоріями */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {categories.map((category) => {
              const categoryProducts = products.filter(
                (p) => p.categoryId === category.id
              );
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  products={categoryProducts}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
