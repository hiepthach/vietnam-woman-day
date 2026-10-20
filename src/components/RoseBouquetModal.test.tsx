import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoseBouquetModal } from './RoseBouquetModal';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

describe('RoseBouquetModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    soundManager.reset();
  });

  it('does not render anything when isOpen is false', () => {
    render(
      <RoseBouquetModal
        isOpen={false}
        onClose={vi.fn()}
        recipientName="Bé Yêu"
      />
    );

    expect(screen.queryByTestId('rose-bouquet-modal')).not.toBeInTheDocument();
  });

  it('renders modal dialog when isOpen is true and plays success chime', () => {
    const playSuccessSpy = vi.spyOn(soundManager, 'playSuccess').mockImplementation(() => {});

    render(
      <RoseBouquetModal
        isOpen={true}
        onClose={vi.fn()}
        recipientName="Người Yêu Bé Nhỏ"
        senderName="Anh Yêu"
      />
    );

    expect(screen.getByTestId('rose-bouquet-modal')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Thương tặng Người Yêu Bé Nhỏ/i)).toBeInTheDocument();
    expect(screen.getByText(/Yêu thương từ Anh Yêu/i)).toBeInTheDocument();
    expect(playSuccessSpy).toHaveBeenCalledTimes(1);
  });

  it('triggers pop sound, flower petals confetti, and increments heart count when bouquet is clicked', () => {
    const playPopSpy = vi.spyOn(soundManager, 'playPop').mockImplementation(() => {});
    const confettiSpy = vi.spyOn(triggerConfetti, 'fireFlowerPetals').mockImplementation(() => {});

    render(
      <RoseBouquetModal
        isOpen={true}
        onClose={vi.fn()}
        recipientName="Em"
      />
    );

    const touchBtn = screen.getByTestId('touch-flower-button');
    fireEvent.click(touchBtn);

    expect(playPopSpy).toHaveBeenCalledTimes(1);
    expect(confettiSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Chạm để gửi tim \(1\)/i)).toBeInTheDocument();

    // Also clicking directly on the SVG art
    const bouquetArt = screen.getByTestId('rose-bouquet-art');
    fireEvent.click(bouquetArt);

    expect(playPopSpy).toHaveBeenCalledTimes(2);
    expect(confettiSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/Chạm để gửi tim \(2\)/i)).toBeInTheDocument();
  });

  it('calls onClose when close button, accept button, or backdrop is clicked', () => {
    const onClose = vi.fn();

    render(
      <RoseBouquetModal
        isOpen={true}
        onClose={onClose}
        recipientName="Em"
      />
    );

    // Click accept button
    fireEvent.click(screen.getByTestId('accept-flower-button'));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Click close icon button
    fireEvent.click(screen.getByTestId('close-bouquet-button'));
    expect(onClose).toHaveBeenCalledTimes(2);

    // Click backdrop
    fireEvent.click(screen.getByTestId('rose-bouquet-modal'));
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
