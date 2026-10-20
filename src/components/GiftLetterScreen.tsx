import React, { useState, useRef, useEffect } from 'react';
import {
  Gift,
  Heart,
  Sparkles,
  RotateCcw,
  PartyPopper,
  Ticket,
  Check,
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import { cleanVietnameseText } from '../utils/vietnameseText';
import { RoseBouquetModal } from './RoseBouquetModal';

export interface GiftLetterScreenProps {
  onRestart: () => void;
  className?: string;
}

export const GiftLetterScreen: React.FC<GiftLetterScreenProps> = ({
  onRestart,
  className = '',
}) => {
  const { config } = useConfig();
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [activatedCoupons, setActivatedCoupons] = useState<Set<string>>(new Set());
  const [isRoseBouquetOpen, setIsRoseBouquetOpen] = useState(false);
  const fireworksTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (fireworksTimerRef.current) {
        clearTimeout(fireworksTimerRef.current);
      }
    };
  }, []);

  const coupons = config.coupons || [];
  const giftLetter = config.giftLetter;

  const handleOpenGift = () => {
    if (isBoxOpen) return;
    try {
      soundManager.playOpenGift();
      triggerConfetti.fireGiftExplosion();
    } catch {
      // Audio / confetti fallback
    } finally {
      setIsBoxOpen(true);
    }

    if (fireworksTimerRef.current) {
      clearTimeout(fireworksTimerRef.current);
    }
    // Reveal the gorgeous rose bouquet as the gift box opens and fireworks burst
    fireworksTimerRef.current = setTimeout(() => {
      setIsRoseBouquetOpen(true);
    }, 1200);
  };

  const handleUseCoupon = (couponId: string) => {
    if (activatedCoupons.has(couponId)) return;
    try {
      soundManager.playPop();
    } catch {
      // Audio fallback
    }
    setActivatedCoupons((prev) => {
      const next = new Set(prev);
      next.add(couponId);
      return next;
    });
  };

  const handleFireworks = () => {
    try {
      soundManager.playSuccess();
      triggerConfetti.fireGiftExplosion();
    } catch {
      // Audio / confetti fallback
    }

    if (fireworksTimerRef.current) {
      clearTimeout(fireworksTimerRef.current);
    }
    // After fireworks start soaring, smoothly blur and reveal the glowing rose bouquet
    fireworksTimerRef.current = setTimeout(() => {
      setIsRoseBouquetOpen(true);
    }, 1200);
  };

  return (
    <section
      data-testid="gift-letter-screen"
      className={`min-h-screen relative w-full overflow-x-hidden p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center transition-colors duration-700 ${
        isBoxOpen
          ? 'bg-gradient-to-b from-rose-50 via-pink-50/70 to-rose-100'
          : 'bg-gradient-to-b from-pink-50 via-rose-50 to-pink-100'
      } ${className}`.trim()}
      aria-label="Món quà và bức thư tình 20/10"
    >
      <style>{`
        @keyframes gentleWobble {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-3deg) scale(1.02); }
          75% { transform: rotate(3deg) scale(1.02); }
        }
        .animate-gentle-wobble {
          animation: gentleWobble 2.8s ease-in-out infinite;
        }
        @keyframes stampAppear {
          0% {
            opacity: 0;
            transform: scale(2) rotate(-25deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(-12deg);
          }
        }
        .animate-stamp {
          animation: stampAppear 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Decorative ambient glowing backdrops */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-tr from-pink-300/25 to-rose-300/25 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-6 w-64 h-64 bg-rose-200/20 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* ========================================================
          STAGE 1: UNOPENED GIFT BOX ENTRANCE
          ======================================================== */}
      {!isBoxOpen && (
        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center py-8">
          {/* Completion Celebration Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/90 text-rose-700 text-xs sm:text-sm font-semibold border border-rose-200 shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <span>Chúc mừng em đã hoàn thành mọi thử thách! 🎁</span>
            </span>
          </div>

          {/* Interactive 3D Gift Box Visual */}
          <div
            data-testid="unopened-gift-box"
            onClick={handleOpenGift}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenGift();
              }
            }}
            aria-label="Hộp quà bí ẩn 20/10. Chạm để mở quà"
            className="group cursor-pointer select-none relative my-6 focus:outline-none focus:ring-4 focus:ring-rose-300 rounded-3xl p-4 transition-transform active:scale-95"
          >
            {/* Glowing Ring Base */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"
              aria-hidden="true"
            />

            {/* 3D Box Illustration */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex flex-col items-center justify-center animate-gentle-wobble">
              {/* Bow / Ribbon on Top */}
              <div className="relative z-20 flex justify-center -mb-3 drop-shadow-md">
                {/* Left ribbon loop */}
                <div className="w-12 h-10 rounded-full border-4 border-amber-300 bg-amber-400 -rotate-25 shadow-inner" />
                {/* Ribbon knot center */}
                <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-amber-200 z-10 -mx-2 shadow" />
                {/* Right ribbon loop */}
                <div className="w-12 h-10 rounded-full border-4 border-amber-300 bg-amber-400 rotate-25 shadow-inner" />
              </div>

              {/* Gift Box Lid */}
              <div className="w-44 sm:w-52 h-10 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 rounded-t-xl rounded-b-md shadow-lg relative z-10 flex items-center justify-center border-b-2 border-rose-700/40">
                <div className="w-6 h-full bg-gradient-to-b from-amber-300 to-amber-400 shadow-sm" />
              </div>

              {/* Gift Box Main Body */}
              <div className="w-40 sm:w-48 h-32 sm:h-36 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-b-2xl shadow-2xl relative overflow-hidden flex justify-center">
                {/* Vertical Ribbon */}
                <div className="w-6 h-full bg-gradient-to-r from-amber-300 to-amber-400 shadow-sm" />
                {/* Horizontal Ribbon */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-6 bg-gradient-to-b from-amber-300 to-amber-400 shadow-sm" />
                {/* Sparkle badge */}
                <div className="absolute top-2 right-2 text-amber-200 animate-pulse">
                  ✨
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle Hint */}
          <p className="text-gray-600 text-sm sm:text-base font-medium mb-6 max-w-sm">
            Món quà đặc biệt nhất ngày hôm nay đang chờ em khám phá bên trong chiếc hộp! 💝
          </p>

          {/* Big Interactive Open CTA Button */}
          <button
            type="button"
            data-testid="open-gift-button"
            onClick={handleOpenGift}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-base sm:text-lg shadow-xl shadow-rose-300/50 hover:shadow-2xl hover:shadow-rose-400/60 hover:scale-[1.03] active:scale-95 transition-all duration-300 min-h-[48px] animate-bounce cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-300"
          >
            <Gift className="w-5 h-5 text-amber-200 animate-pulse" aria-hidden="true" />
            <span>Chạm để mở món quà đặc biệt 20/10 ✨</span>
          </button>
        </div>
      )}

      {/* ========================================================
          STAGE 2: GRAND REVEAL CONTENT (AFTER GIFT IS OPENED)
          ======================================================== */}
      {isBoxOpen && (
        <div
          data-testid="grand-reveal"
          className="relative z-10 w-full max-w-2xl mx-auto flex flex-col gap-10 py-6 sm:py-10 animate-fade-in"
        >
          {/* Header Salutation */}
          <header className="text-center">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs sm:text-sm font-semibold border border-rose-200 mb-3 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <span>Ngày Phụ Nữ Việt Nam 20/10</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" aria-hidden="true" />
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 tracking-tight">
              Món Quà Tình Yêu Dành Tặng {cleanVietnameseText(config.recipientName)} 💖
            </h1>
          </header>

          {/* Section 1: Love Letter (Bức Thư Tình Cảm) */}
          {giftLetter && (
            <article
              data-testid="love-letter-card"
              className="bg-gradient-to-b from-amber-50/95 via-rose-50/30 to-amber-50/95 border border-amber-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm transition-all hover:shadow-rose-200/50"
            >
              {/* Decorative Corner Ornaments */}
              <div
                className="absolute top-3 left-4 text-2xl text-amber-300/60 select-none pointer-events-none"
                aria-hidden="true"
              >
                ❧
              </div>
              <div
                className="absolute top-3 right-4 text-2xl text-amber-300/60 select-none pointer-events-none"
                aria-hidden="true"
              >
                ☙
              </div>

              {/* Letter Title */}
              <h2
                data-testid="letter-title"
                className="font-heading text-2xl sm:text-3xl font-bold text-amber-950 text-center mb-6 pb-3 border-b border-amber-200/70 tracking-normal"
              >
                {cleanVietnameseText(giftLetter.title)}
              </h2>

              {/* Letter Paragraphs */}
              <div className="space-y-5 text-amber-950/90 text-base sm:text-lg leading-relaxed sm:leading-loose font-serif text-left">
                {giftLetter.paragraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    data-testid={`letter-paragraph-${idx}`}
                    className="indent-6 sm:indent-8"
                  >
                    {cleanVietnameseText(paragraph)}
                  </p>
                ))}
              </div>

              {/* Letter Closing & Sender Signature */}
              <div
                data-testid="letter-closing"
                className="mt-8 pt-4 border-t border-amber-200/70 text-right"
              >
                <p className="font-handwriting text-2xl sm:text-3xl text-rose-700 mb-1">
                  {cleanVietnameseText(giftLetter.closing)}
                </p>
                <p className="font-heading font-bold text-xl sm:text-2xl text-rose-600">
                  {cleanVietnameseText(config.senderName)} ❤️
                </p>
              </div>
            </article>
          )}

          {/* Section 2: Love Coupons (Phiếu Đặc Quyền Yêu Thương) */}
          {coupons.length > 0 && (
            <section className="w-full">
              <div className="text-center mb-6">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-500">
                  Phiếu Đặc Quyền Dành Cho Em 🎟️
                </span>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                  Love Coupons - Toàn Quyền Sử Dụng Mọi Lúc
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Chạm để đóng dấu kích hoạt phiếu khi em muốn anh thực hiện nhé! 🥰
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {coupons.map((coupon) => {
                  const isActivated = activatedCoupons.has(coupon.id);

                  return (
                    <div
                      key={coupon.id}
                      data-testid={`coupon-card-${coupon.id}`}
                      className="border-2 border-dashed border-rose-300 bg-rose-50/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm min-h-[160px]"
                    >
                      {/* Ticket Notch Cutouts */}
                      <div
                        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-100/90 border-r-2 border-dashed border-rose-300 pointer-events-none"
                        aria-hidden="true"
                      />
                      <div
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-100/90 border-l-2 border-dashed border-rose-300 pointer-events-none"
                        aria-hidden="true"
                      />

                      {/* Coupon Content */}
                      <div>
                        <div className="flex items-start gap-3">
                          <span
                            className="text-3xl sm:text-4xl select-none"
                            aria-hidden="true"
                          >
                            {coupon.icon}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-bold text-rose-950 text-base sm:text-lg leading-snug">
                              {coupon.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-rose-800/80 mt-1 leading-relaxed">
                              {coupon.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Coupon Action Button */}
                      <div className="mt-4 pt-3 border-t border-dashed border-rose-200 flex justify-end">
                        <button
                          type="button"
                          data-testid={`coupon-use-btn-${coupon.id}`}
                          disabled={isActivated}
                          onClick={() => handleUseCoupon(coupon.id)}
                          aria-label={`Sử dụng phiếu ${coupon.title}`}
                          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-300 ${
                            isActivated
                              ? 'bg-rose-200/70 text-rose-500 cursor-not-allowed opacity-80'
                              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm hover:shadow active:scale-95'
                          }`}
                        >
                          {isActivated ? (
                            <>
                              <Check className="w-4 h-4 text-rose-600" aria-hidden="true" />
                              <span>Đã dùng ❤️</span>
                            </>
                          ) : (
                            <>
                              <Ticket className="w-4 h-4 text-amber-200" aria-hidden="true" />
                              <span>Dùng phiếu này 🎟️</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Bold Red Stamp across the coupon when activated */}
                      {isActivated && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                          <div
                            data-testid={`coupon-stamp-${coupon.id}`}
                            className="border-4 border-red-500 text-red-600 font-black text-lg sm:text-xl px-4 py-1.5 rounded-lg -rotate-12 uppercase tracking-widest bg-white/80 backdrop-blur-sm shadow-md animate-stamp"
                          >
                            ĐÃ SỬ DỤNG ❤️
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 3: Footer Controls */}
          <footer className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-rose-200/80">
            {/* Replay / Restart Button */}
            <button
              type="button"
              data-testid="restart-button"
              onClick={onRestart}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-full bg-white/90 border border-rose-300 text-rose-700 font-bold text-sm sm:text-base shadow-sm hover:bg-rose-50 hover:border-rose-400 hover:shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <RotateCcw className="w-4 h-4 text-rose-500" aria-hidden="true" />
              <span>Xem lại hành trình từ đầu 🔄</span>
            </button>

            {/* Fire Confetti Celebration Button */}
            <button
              type="button"
              data-testid="fireworks-button"
              onClick={handleFireworks}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg hover:from-rose-600 hover:to-pink-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <PartyPopper className="w-5 h-5 text-amber-200" aria-hidden="true" />
              <span>Bắn pháo hoa ăn mừng 🎉</span>
            </button>
          </footer>
        </div>
      )}

      {/* Rose Bouquet Celebration Modal */}
      <RoseBouquetModal
        isOpen={isRoseBouquetOpen}
        onClose={() => setIsRoseBouquetOpen(false)}
        recipientName={config.recipientName}
        senderName={config.senderName}
      />
    </section>
  );
};
