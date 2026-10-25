'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import confetti from 'canvas-confetti';
import {
  Truck,
  Store,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Phone,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/useCartStore';
import { useI18n } from '@/lib/i18nContext';
import { createOrder } from '@/lib/supabase';
import { brandTheme } from '@/config/theme';
import { formatPrice } from '@/lib/utils';
import { DeliveryMethod, PaymentMethod, Order } from '@/types';

// Схема валідації Zod
const checkoutSchema = z.object({
  name: z.string().min(2, 'Імʼя занадто коротке'),
  phone: z.string().min(7, 'Введіть коректний номер телефону'),
  deliveryMethod: z.enum(['delivery', 'pickup']),
  street: z.string().optional(),
  house: z.string().optional(),
  apartment: z.string().optional(),
  floor: z.string().optional(),
  entryCode: z.string().optional(),
  paymentMethod: z.enum(['blik_online', 'card_courier', 'cash']),
  changeFrom: z.string().optional(),
  comment: z.string().optional(),
}).refine(
  (data) => {
    if (data.deliveryMethod === 'delivery') {
      return Boolean(data.street && data.street.trim().length > 0 && data.house && data.house.trim().length > 0);
    }
    return true;
  },
  {
    message: 'Для доставки обовʼязково вкажіть вулицю та номер будинку',
    path: ['street'],
  }
);

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutModal() {
  const { locale, t } = useI18n();
  const isCheckoutOpen = useCartStore((s) => s.isCheckoutOpen);
  const setIsCheckoutOpen = useCartStore((s) => s.setIsCheckoutOpen);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const personsCount = useCartStore((s) => s.personsCount);

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const isPickup = deliveryMethod === 'pickup';
  const subtotal = useCartStore((s) => s.getSubtotal)();
  const deliveryFee = useCartStore((s) => s.getDeliveryFee)(isPickup);
  const total = useCartStore((s) => s.getTotal)(isPickup);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      deliveryMethod: 'delivery',
      street: '',
      house: '',
      apartment: '',
      floor: '',
      entryCode: '',
      paymentMethod: 'blik_online',
      changeFrom: '',
      comment: '',
    },
  });

  const selectedPayment = watch('paymentMethod');

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);
    try {
      const orderId = `MS-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderData: Order = {
        id: orderId,
        name: values.name,
        phone: values.phone,
        deliveryMethod: values.deliveryMethod,
        address:
          values.deliveryMethod === 'delivery'
            ? {
                street: values.street || '',
                house: values.house || '',
                apartment: values.apartment,
                floor: values.floor,
                entryCode: values.entryCode,
              }
            : undefined,
        paymentMethod: values.paymentMethod,
        changeFrom: values.changeFrom,
        comment: values.comment,
        personsCount,
        items,
        subtotal,
        deliveryFee,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await createOrder(orderData);

      // Запуск феєрверку конфеті
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e50914', '#eab308', '#ffffff', '#22c55e'],
        });
      } catch {
        // ігноруємо помилки confetti на деяких оточеннях
      }

      setCreatedOrder(orderData);
      clearCart();
    } catch (error) {
      console.error('Order checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (createdOrder) {
      setCreatedOrder(null);
      reset();
    }
  };

  return (
    <Dialog
      isOpen={isCheckoutOpen}
      onClose={handleClose}
      title={
        createdOrder ? (
          <span className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            {t.checkout.successTitle}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#e50914]" />
            {t.checkout.title}
          </span>
        )
      }
      maxWidth="max-w-2xl"
    >
      {createdOrder ? (
        /* Екран успіху після оформлення замовлення */
        <div className="py-6 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto animate-in zoom-in">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">
              {t.checkout.successTitle}
            </h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              {t.checkout.successMessage}
            </p>
          </div>

          {/* Інформаційна картка замовлення */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#171722] border border-white/10 text-left space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs text-zinc-400">{t.checkout.orderNumber}</span>
              <span className="text-sm font-black text-[#e50914]">{createdOrder.id}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs text-zinc-400">{t.checkout.deliveryMethod}</span>
              <span className="text-xs font-bold text-white">
                {createdOrder.deliveryMethod === 'delivery'
                  ? t.checkout.delivery
                  : `${t.checkout.pickup} (-10%)`}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs text-zinc-400">{t.checkout.estimatedTime}</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {createdOrder.deliveryMethod === 'delivery'
                  ? brandTheme.delivery.estimatedDeliveryTime + ' min'
                  : brandTheme.delivery.estimatedPickupTime + ' min'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 text-base font-extrabold text-white">
              <span>{t.checkout.orderSummary}</span>
              <span className="text-[#e50914]">{formatPrice(createdOrder.total, locale)}</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full max-w-md py-3.5 px-6 rounded-xl bg-[#e50914] hover:bg-[#f4222d] text-white font-bold text-sm shadow-lg shadow-[#e50914]/30 transition-all cursor-pointer"
          >
            {t.checkout.backToMenu}
          </button>
        </div>
      ) : (
        /* Форма замовлення */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4 max-w-full">
          {/* Вибір: Доставка чи Самовивіз */}
          <div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeliveryMethod('delivery');
                  setValue('deliveryMethod', 'delivery');
                }}
                className={`flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  deliveryMethod === 'delivery'
                    ? 'bg-[#e50914]/15 border-[#e50914] text-white shadow-xs'
                    : 'bg-[#181822] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <Truck className={`w-4 h-4 shrink-0 ${deliveryMethod === 'delivery' ? 'text-[#e50914]' : ''}`} />
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm leading-none">{t.checkout.delivery}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">~{brandTheme.delivery.estimatedDeliveryTime} min</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeliveryMethod('pickup');
                  setValue('deliveryMethod', 'pickup');
                }}
                className={`flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  deliveryMethod === 'pickup'
                    ? 'bg-[#e50914]/15 border-[#e50914] text-white shadow-xs'
                    : 'bg-[#181822] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <Store className={`w-4 h-4 shrink-0 ${deliveryMethod === 'pickup' ? 'text-[#e50914]' : ''}`} />
                <div className="text-left">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm leading-none">
                    <span>{t.checkout.pickup}</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-black">-10%</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">~{brandTheme.delivery.estimatedPickupTime} min</div>
                </div>
              </button>
            </div>
          </div>

          {/* Контактні дані: компактні інпути */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <Input
              label={t.checkout.name}
              id="customer-name"
              placeholder={t.checkout.namePlaceholder}
              error={errors.name?.message}
              className="h-9 sm:h-9.5 text-xs sm:text-sm"
              {...register('name')}
            />
            <Input
              label={t.checkout.phone}
              id="customer-phone"
              placeholder={t.checkout.phonePlaceholder}
              error={errors.phone?.message}
              className="h-9 sm:h-9.5 text-xs sm:text-sm"
              {...register('phone')}
            />
          </div>

          {/* Адреса доставки (тільки при доставці) */}
          {deliveryMethod === 'delivery' && (
            <div className="space-y-2 p-2.5 sm:p-3 rounded-xl bg-[#161620] border border-white/5">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#e50914]" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                  {t.checkout.addressTitle} ({brandTheme.contacts.city})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <Input
                    label={t.checkout.street}
                    id="order-street"
                    placeholder={t.checkout.streetPlaceholder}
                    error={errors.street?.message}
                    className="h-8.5 sm:h-9 text-xs"
                    {...register('street')}
                  />
                </div>
                <div>
                  <Input
                    label={t.checkout.house}
                    id="order-house"
                    placeholder={t.checkout.housePlaceholder}
                    error={errors.house?.message}
                    className="h-8.5 sm:h-9 text-xs"
                    {...register('house')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Input
                  label={t.checkout.apartment}
                  id="order-apartment"
                  placeholder={t.checkout.apartmentPlaceholder}
                  className="h-8 sm:h-8.5 text-xs"
                  {...register('apartment')}
                />
                <Input
                  label={t.checkout.floor}
                  id="order-floor"
                  placeholder={t.checkout.floorPlaceholder}
                  className="h-8 sm:h-8.5 text-xs"
                  {...register('floor')}
                />
                <Input
                  label={t.checkout.entryCode}
                  id="order-entry-code"
                  placeholder={t.checkout.entryCodePlaceholder}
                  className="h-8 sm:h-8.5 text-xs"
                  {...register('entryCode')}
                />
              </div>
            </div>
          )}

          {/* Спосіб оплати: компактний горизонтальний ряд */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              {t.checkout.paymentTitle}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPayment === 'blik_online'
                    ? 'bg-[#e50914]/15 border-[#e50914] text-white shadow-xs'
                    : 'bg-[#171720] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  value="blik_online"
                  className="sr-only"
                  {...register('paymentMethod')}
                />
                <Smartphone className="w-3.5 h-3.5 text-[#e50914] shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold truncate">{t.checkout.blikOnline}</span>
              </label>

              <label
                className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPayment === 'card_courier'
                    ? 'bg-[#e50914]/15 border-[#e50914] text-white shadow-xs'
                    : 'bg-[#171720] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  value="card_courier"
                  className="sr-only"
                  {...register('paymentMethod')}
                />
                <CreditCard className="w-3.5 h-3.5 text-[#e50914] shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold truncate">{t.checkout.cardCourier}</span>
              </label>

              <label
                className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPayment === 'cash'
                    ? 'bg-[#e50914]/15 border-[#e50914] text-white shadow-xs'
                    : 'bg-[#171720] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  value="cash"
                  className="sr-only"
                  {...register('paymentMethod')}
                />
                <Banknote className="w-3.5 h-3.5 text-[#e50914] shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold truncate">{t.checkout.cash}</span>
              </label>
            </div>

            {selectedPayment === 'cash' && (
              <div className="mt-1.5">
                <Input
                  label={t.checkout.changeFrom}
                  id="order-change-from"
                  placeholder={t.checkout.changeFromPlaceholder}
                  className="h-8.5 text-xs"
                  {...register('changeFrom')}
                />
              </div>
            )}
          </div>

          {/* Коментар: 1 рядок */}
          <div>
            <input
              id="order-comment"
              type="text"
              placeholder={t.checkout.commentPlaceholder}
              className="w-full rounded-xl border border-zinc-800 bg-[#0d0d12] px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-[#e50914] focus:outline-none focus:ring-1 focus:ring-[#e50914]"
              {...register('comment')}
            />
          </div>

          {/* Підсумок замовлення та кнопка відправки в одному компактному блоці */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-zinc-400 font-medium">{t.cart.total}:</span>
              <span className="text-lg sm:text-xl font-black text-[#e50914]">{formatPrice(total, locale)}</span>
              {isPickup && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {t.checkout.pickupDiscount} -10%
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              id="submit-order-button"
              className="flex-1 sm:max-w-xs flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-[#e50914] to-[#f4222d] hover:brightness-110 text-white font-bold text-sm shadow-md shadow-[#e50914]/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{t.checkout.submitOrder}</span>
              )}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
