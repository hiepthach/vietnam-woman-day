import confetti from 'canvas-confetti';

const ROMANTIC_PALETTE = ['#ff4d6d', '#ff758f', '#ff85a1', '#fbb1bd', '#ffd166', '#ffffff'];
const JOYFUL_PALETTE = ['#ff4d6d', '#ffd166', '#06d6a0', '#118ab2', '#ff758f'];

export const triggerConfetti = {
  /**
   * Soft falling petals / confetti with romantic pink, rose, gold, and white colors
   */
  fireFlowerPetals: () => {
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 100,
      startVelocity: 25,
      gravity: 0.6,
      drift: 0.2,
      ticks: 250,
      origin: { x: 0.5, y: -0.1 },
      colors: ROMANTIC_PALETTE,
      scalar: 1.2,
    });
  },

  /**
   * Full screen fireworks / confetti explosion lasting 3-4s
   */
  fireGiftExplosion: () => {
    // Immediate centerpiece burst
    confetti({
      particleCount: 100,
      spread: 360,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.5 },
      colors: ROMANTIC_PALETTE,
    });

    const duration = 3500;
    const animationEnd = Date.now() + duration;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 40 * (timeLeft / duration);

      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: Math.random() * 0.4 + 0.3 },
        colors: ROMANTIC_PALETTE,
      });

      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: Math.random() * 0.4 + 0.3 },
        colors: ROMANTIC_PALETTE,
      });
    }, 250);
  },

  /**
   * Small joyful burst for quiz answers
   */
  fireMiniBurst: () => {
    confetti({
      particleCount: 35,
      spread: 60,
      startVelocity: 30,
      origin: { y: 0.7 },
      colors: JOYFUL_PALETTE,
    });
  },
};
