'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { useI18n } from '@/lib/i18nContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { locale, t } = useI18n();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const setSelectedProduct = useCartStore((s) => s.setSelectedProduct);
  const activeCardId = useCartStore((s) => s.activeCardId);
  const setActiveCardId = useCartStore((s) => s.setActiveCardId);

  const cartItem = mounted ? items.find((item) => item.product.id === product.id) : undefined;
  const quantity = cartItem?.quantity || 0;
  const isEditing = activeCardId === product.id && quantity > 0;

  // Автоматичне повернення кнопки до компактного стану після 3.5 секунд бездіяльності
  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(() => {
      if (activeCardId === product.id) {
        setActiveCardId(null);
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [isEditing, quantity, activeCardId, product.id, setActiveCardId]);

  // Форматування ціни у формат "16,00 PLN"
  const formattedPrice = `${product.price.toFixed(2).replace('.', ',')} PLN`;
  const isDodatki = product.categoryId === 'dodatki';

  // Форматування підпису порції: для додатків cena za 30 ml / 1 szt / 15 g / 35 g
  const getSubtitle = () => {
    if (isDodatki) {
      if (product.id === 'pomocniki-do-paleczek') {
        return locale === 'pl' ? 'CENA ZA 1 SZT.' : 'ЦІНА ЗА 1 ШТ.';
      }
      if (product.id === 'wasabi-dodatkowy') {
        return locale === 'pl' ? 'CENA ZA 15 G' : 'ЦІНА ЗА 15 Г';
      }
      if (product.id === 'imbir-dodatkowy') {
        return locale === 'pl' ? 'CENA ZA 30 G' : 'ЦІНА ЗА 30 Г';
      }
      if (product.id === 'sos-sojowy-dodatkowy') {
        return locale === 'pl' ? 'CENA ZA 30 ML' : 'ЦІНА ЗА 30 МЛ';
      }
      return locale === 'pl' ? `CENA ZA ${product.weight || 35} ML` : `ЦІНА ЗА ${product.weight || 35} МЛ`;
    }
    return locale === 'pl' 
      ? `CENA ZA ${product.pieces || 8} SZT.` 
      : `ЦІНА ЗА ${product.pieces || 8} ШТ.`;
  };

  const piecesText = getSubtitle();

  return (
    <div
      ref={cardRef}
      onClick={() => setSelectedProduct(product)}
      className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-[#0d0d12]/90 hover:bg-[#14141d] border border-white/5 hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-black/70 cursor-pointer select-none"
    >
      {/* Верхня частина: Назва + Блок інгредієнтів (та фото для звичайних ролів) */}
      <div>
        {/* Назва ролу або додатку капсом (відцентрована) */}
        <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-white text-center group-hover:text-[#e50914] transition-colors leading-tight mb-2.5">
          {product.name[locale]}
        </h3>

        {/* Стовпчик інгредієнтів та опис */}
        {isDodatki ? (
          <div className="flex flex-col items-center text-center py-2 px-1">
            <span className="text-[11px] sm:text-xs text-zinc-400 font-medium uppercase tracking-wider">
              {product.ingredients[locale][0] || (locale === 'pl' ? 'DODATKOWY' : 'ДОДАТКОВИЙ')}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 sm:gap-4 pr-1.5 sm:pr-3">
            {/* Склад ролу стовпчиком */}
            <div className="flex flex-col gap-0.5 text-[10px] sm:text-[11px] text-zinc-400 font-medium uppercase tracking-wider leading-snug">
              {product.ingredients[locale].map((ingredient, idx) => (
                <span key={idx}>{ingredient}</span>
              ))}
            </div>

            {/* Кругле фото ролу на чорному тлі праворуч */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-black border border-white/10 group-hover:border-white/25 flex items-center justify-center p-1 transition-all duration-300 group-hover:scale-105 shadow-inner flex-shrink-0">
              <img
                src={product.image}
                alt={product.name[locale]}
                loading="lazy"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Нижня частина: Центрована ціна та центрована кнопка замовлення */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="mt-3 pt-2.5 border-t border-white/5 flex flex-col items-center text-center gap-2"
      >
        <div className="w-full text-center">
          <div className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
            {formattedPrice}
          </div>
          <div className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">
            {piecesText}
          </div>
        </div>

        {/* Фіксована висота h-8 (32px), щоб сітка ніколи не стрибала при зміні стану */}
        <div className="w-full h-8 flex items-center justify-center">
          {quantity === 0 ? (
            /* Якщо товар не в кошику — звичайна кнопка "Do koszyka" */
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addItem(product);
                setActiveCardId(product.id);
              }}
              className="h-8 flex items-center justify-center gap-1.5 px-4 rounded-lg bg-[#e50914] hover:bg-[#f4222d] text-white text-xs font-bold shadow-sm shadow-[#e50914]/25 hover:shadow-[#e50914]/40 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.product.addToCart}</span>
            </button>
          ) : isEditing ? (
            /* Режим швидкої зміни кількості з ідентичною висотою h-8 */
            <div className="h-8 inline-flex items-center gap-1 bg-[#171722] border border-emerald-500/50 rounded-lg p-0.5 shadow-sm shadow-emerald-500/10 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = quantity - 1;
                  updateQuantity(product.id, next);
                  if (next <= 0) setActiveCardId(null);
                }}
                aria-label="Зменшити"
                className="flex items-center justify-center w-7 h-7 rounded-md bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-white px-2 min-w-[28px] text-center select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(product.id, quantity + 1);
                }}
                aria-label="Збільшити"
                className="flex items-center justify-center w-7 h-7 rounded-md bg-[#e50914] hover:bg-[#f4222d] text-white transition-colors cursor-pointer shadow-sm shadow-[#e50914]/30"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Коли фокус перейшов на інший рол — охайна кнопка "W koszyku (N)" тієї ж висоти h-8 */
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveCardId(product.id);
              }}
              className="h-8 flex items-center justify-center gap-1.5 px-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 animate-in fade-in duration-150"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{locale === 'pl' ? `W koszyku (${quantity})` : `У кошику (${quantity})`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
