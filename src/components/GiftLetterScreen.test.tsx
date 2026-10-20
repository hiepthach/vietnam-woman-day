import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GiftLetterScreen } from './GiftLetterScreen';
import { ConfigProvider } from '../context/ConfigContext';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import { DEFAULT_CONFIG } from '../data/defaultConfig';
import { AppConfig } from '../types';

describe('GiftLetterScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    soundManager.reset();
    localStorage.clear();
  });

  const renderGiftLetterScreen = (onRestart = vi.fn()) => {
    return {
      onRestart,
      ...render(
        <ConfigProvider>
          <GiftLetterScreen onRestart={onRestart} />
        </ConfigProvider>
      ),
    };
  };

  describe('Initial Unopened Gift Box State', () => {
    it('renders the initial unopened state with 3D gift box and CTA button', () => {
      renderGiftLetterScreen();

      expect(screen.getByTestId('gift-letter-screen')).toBeInTheDocument();
      expect(screen.getByTestId('unopened-gift-box')).toBeInTheDocument();

      const ctaBtn = screen.getByTestId('open-gift-button');
      expect(ctaBtn).toBeInTheDocument();
      expect(ctaBtn).toHaveTextContent(/Chạm để mở món quà đặc biệt 20\/10/i);
      expect(ctaBtn).toHaveClass('min-h-[48px]');

      // Completion caption
      expect(
        screen.getByText(/Chúc mừng em đã hoàn thành mọi thử thách!/i)
      ).toBeInTheDocument();

      // Grand reveal content should not be present yet
      expect(screen.queryByTestId('grand-reveal')).not.toBeInTheDocument();
    });
  });

  describe('Opening Gift Box Reveal Flow', () => {
    it('calls soundManager.playOpenGift, fires gift explosion confetti, and reveals grand content when open button is clicked', () => {
      const playOpenGiftSpy = vi.spyOn(soundManager, 'playOpenGift').mockImplementation(() => {});
      const confettiSpy = vi.spyOn(triggerConfetti, 'fireGiftExplosion').mockImplementation(() => {});

      renderGiftLetterScreen();

      const openBtn = screen.getByTestId('open-gift-button');
      fireEvent.click(openBtn);

      expect(playOpenGiftSpy).toHaveBeenCalledTimes(1);
      expect(confettiSpy).toHaveBeenCalledTimes(1);

      // Unopened box is gone and grand reveal is displayed
      expect(screen.queryByTestId('unopened-gift-box')).not.toBeInTheDocument();
      expect(screen.getByTestId('grand-reveal')).toBeInTheDocument();
    });

    it('reveals rose bouquet modal after 1200ms delay when opening the gift box', () => {
      vi.useFakeTimers();
      vi.spyOn(soundManager, 'playOpenGift').mockImplementation(() => {});
      vi.spyOn(triggerConfetti, 'fireGiftExplosion').mockImplementation(() => {});

      renderGiftLetterScreen();

      const openBtn = screen.getByTestId('open-gift-button');
      fireEvent.click(openBtn);

      expect(screen.queryByTestId('rose-bouquet-modal')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1200);
      });

      expect(screen.getByTestId('rose-bouquet-modal')).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByTestId('accept-flower-button'));
      });

      expect(screen.queryByTestId('rose-bouquet-modal')).not.toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('Love Letter (Bức Thư Tình Cảm)', () => {
    it('renders letter title, all paragraphs, and closing signature', () => {
      renderGiftLetterScreen();
      fireEvent.click(screen.getByTestId('open-gift-button'));

      const letterCard = screen.getByTestId('love-letter-card');
      expect(letterCard).toBeInTheDocument();

      // Title
      const title = screen.getByTestId('letter-title');
      expect(title).toHaveTextContent(DEFAULT_CONFIG.giftLetter.title);

      // Paragraphs
      DEFAULT_CONFIG.giftLetter.paragraphs.forEach((p, idx) => {
        const paragraphEl = screen.getByTestId(`letter-paragraph-${idx}`);
        expect(paragraphEl).toBeInTheDocument();
        expect(paragraphEl).toHaveTextContent(p);
      });

      // Closing
      const closing = screen.getByTestId('letter-closing');
      expect(closing).toHaveTextContent(DEFAULT_CONFIG.giftLetter.closing);
      expect(closing).toHaveTextContent(DEFAULT_CONFIG.senderName);
    });
  });

  describe('Love Coupons (Phiếu Đặc Quyền Yêu Thương)', () => {
    it('renders all coupons from config with details and use button', () => {
      renderGiftLetterScreen();
      fireEvent.click(screen.getByTestId('open-gift-button'));

      DEFAULT_CONFIG.coupons.forEach((coupon) => {
        const card = screen.getByTestId(`coupon-card-${coupon.id}`);
        expect(card).toBeInTheDocument();
        expect(card).toHaveTextContent(coupon.title);
        expect(card).toHaveTextContent(coupon.description);
        expect(card).toHaveTextContent(coupon.icon);

        const useBtn = screen.getByTestId(`coupon-use-btn-${coupon.id}`);
        expect(useBtn).toBeInTheDocument();
        expect(useBtn).toHaveTextContent(/Dùng phiếu này/i);
        expect(useBtn).toHaveClass('min-h-[44px]');
      });
    });

    it('activates coupon on click, plays pop sound, and shows bold red stamp', () => {
      const playPopSpy = vi.spyOn(soundManager, 'playPop').mockImplementation(() => {});

      renderGiftLetterScreen();
      fireEvent.click(screen.getByTestId('open-gift-button'));

      const firstCoupon = DEFAULT_CONFIG.coupons[0];
      const useBtn = screen.getByTestId(`coupon-use-btn-${firstCoupon.id}`);

      // Before activation, stamp should not exist
      expect(screen.queryByTestId(`coupon-stamp-${firstCoupon.id}`)).not.toBeInTheDocument();

      // Click to use coupon
      fireEvent.click(useBtn);

      expect(playPopSpy).toHaveBeenCalledTimes(1);

      // Stamp appears with rotated style
      const stamp = screen.getByTestId(`coupon-stamp-${firstCoupon.id}`);
      expect(stamp).toBeInTheDocument();
      expect(stamp).toHaveTextContent(/ĐÃ SỬ DỤNG ❤️/i);
      expect(stamp.className).toMatch(/-rotate-12|rotate/);

      // Button is now disabled or shows used state
      expect(useBtn).toBeDisabled();
      expect(useBtn).toHaveTextContent(/Đã dùng/i);
    });

    it('can activate multiple coupons independently', () => {
      renderGiftLetterScreen();
      fireEvent.click(screen.getByTestId('open-gift-button'));

      const coupon1 = DEFAULT_CONFIG.coupons[0];
      const coupon2 = DEFAULT_CONFIG.coupons[1];

      fireEvent.click(screen.getByTestId(`coupon-use-btn-${coupon1.id}`));
      expect(screen.getByTestId(`coupon-stamp-${coupon1.id}`)).toBeInTheDocument();
      expect(screen.queryByTestId(`coupon-stamp-${coupon2.id}`)).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId(`coupon-use-btn-${coupon2.id}`));
      expect(screen.getByTestId(`coupon-stamp-${coupon1.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`coupon-stamp-${coupon2.id}`)).toBeInTheDocument();
    });
  });

  describe('Footer Actions and Restart', () => {
    it('calls onRestart when restart button is clicked', () => {
      const onRestart = vi.fn();
      renderGiftLetterScreen(onRestart);
      fireEvent.click(screen.getByTestId('open-gift-button'));

      const restartBtn = screen.getByTestId('restart-button');
      expect(restartBtn).toBeInTheDocument();
      expect(restartBtn).toHaveTextContent(/Xem lại/i);

      fireEvent.click(restartBtn);
      expect(onRestart).toHaveBeenCalledTimes(1);
    });

    it('triggers celebratory fireworks confetti and reveals rose bouquet modal after delay when fireworks button is clicked', () => {
      vi.useFakeTimers();
      const confettiSpy = vi.spyOn(triggerConfetti, 'fireGiftExplosion').mockImplementation(() => {});
      const playSuccessSpy = vi.spyOn(soundManager, 'playSuccess').mockImplementation(() => {});

      renderGiftLetterScreen();
      fireEvent.click(screen.getByTestId('open-gift-button'));

      const fireworksBtn = screen.getByTestId('fireworks-button');
      expect(fireworksBtn).toBeInTheDocument();
      expect(fireworksBtn).toHaveTextContent(/Bắn pháo hoa/i);

      // Reset count from initial open
      confettiSpy.mockClear();

      fireEvent.click(fireworksBtn);
      expect(confettiSpy).toHaveBeenCalledTimes(1);
      expect(playSuccessSpy).toHaveBeenCalledTimes(1);

      // Before delay, rose bouquet modal should not be visible yet
      expect(screen.queryByTestId('rose-bouquet-modal')).not.toBeInTheDocument();

      // Advance timers by 1200ms
      act(() => {
        vi.advanceTimersByTime(1200);
      });

      // Rose bouquet modal should now be visible
      expect(screen.getByTestId('rose-bouquet-modal')).toBeInTheDocument();
      expect(screen.getByTestId('rose-bouquet-art')).toBeInTheDocument();

      // Accepting flower closes modal
      fireEvent.click(screen.getByTestId('accept-flower-button'));
      expect(screen.queryByTestId('rose-bouquet-modal')).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('Custom Configuration Rendering', () => {
    it('renders customized letter, recipient name, and custom coupons', () => {
      const customConfig: AppConfig = {
        ...DEFAULT_CONFIG,
        recipientName: 'Công Chúa Nhỏ',
        senderName: 'Chàng Hoàng Tử',
        giftLetter: {
          title: 'Thư Gửi Em Yêu Dấu',
          paragraphs: ['Anh yêu em nhiều lắm!', 'Hạnh phúc bên em mỗi ngày.'],
          closing: 'Trọn đời bên em 💖',
        },
        coupons: [
          {
            id: 'custom-c1',
            title: 'Vé xem phim cuối tuần',
            description: 'Đi xem bất kỳ phim nào em thích.',
            icon: '🎬',
          },
        ],
      };
      localStorage.setItem('vietnam_woman_day_config_v1', JSON.stringify(customConfig));

      renderGiftLetterScreen();
      fireEvent.click(screen.getByTestId('open-gift-button'));

      expect(screen.getByTestId('letter-title')).toHaveTextContent('Thư Gửi Em Yêu Dấu');
      expect(screen.getByTestId('letter-paragraph-0')).toHaveTextContent('Anh yêu em nhiều lắm!');
      expect(screen.getByTestId('letter-paragraph-1')).toHaveTextContent('Hạnh phúc bên em mỗi ngày.');
      expect(screen.getByTestId('letter-closing')).toHaveTextContent('Trọn đời bên em 💖');
      expect(screen.getByTestId('letter-closing')).toHaveTextContent('Chàng Hoàng Tử');

      expect(screen.getByTestId('coupon-card-custom-c1')).toHaveTextContent('Vé xem phim cuối tuần');
    });
  });
});
