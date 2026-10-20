import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

export interface RoseBouquetModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  senderName?: string;
}

interface SparkleParticle {
  id: number;
  top: string;
  left?: string;
  right?: string;
  size: number;
  delay: string;
  duration: string;
  color: string;
}

const FAIRY_SPARKLES: SparkleParticle[] = [
  { id: 1, top: '10%', left: '14%', size: 16, delay: '0.1s', duration: '2.4s', color: '#fbbf24' },
  { id: 2, top: '14%', right: '12%', size: 20, delay: '0.5s', duration: '2.8s', color: '#f43f5e' },
  { id: 3, top: '28%', left: '8%', size: 14, delay: '0.8s', duration: '2.2s', color: '#ffd166' },
  { id: 4, top: '32%', right: '8%', size: 18, delay: '0.3s', duration: '2.6s', color: '#fda4af' },
  { id: 5, top: '48%', left: '12%', size: 15, delay: '0.6s', duration: '2.5s', color: '#fbbf24' },
  { id: 6, top: '52%', right: '14%', size: 14, delay: '1.0s', duration: '2.3s', color: '#ffffff' },
  { id: 7, top: '6%', left: '46%', size: 18, delay: '0.2s', duration: '3.0s', color: '#ffd166' },
  { id: 8, top: '70%', left: '18%', size: 13, delay: '0.7s', duration: '2.7s', color: '#f43f5e' },
  { id: 9, top: '68%', right: '18%', size: 15, delay: '0.4s', duration: '2.5s', color: '#fbbf24' },
];

export const RoseBouquetModal: React.FC<RoseBouquetModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  senderName,
}) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const [loveCount, setLoveCount] = useState(0);

  // Play a soft sweet chime sound when the blooming begins
  useEffect(() => {
    if (isOpen) {
      soundManager.playSuccess();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchBouquet = () => {
    setIsWiggling(true);
    setLoveCount((prev) => prev + 1);
    soundManager.playPop();
    triggerConfetti.fireFlowerPetals();

    setTimeout(() => {
      setIsWiggling(false);
    }, 600);
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rose-modal-title"
      data-testid="rose-bouquet-modal"
      className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md transition-opacity duration-700 select-none animate-fade-in"
      onClick={onClose}
    >
      <style>{`
        /* Staggered Realistic Rose Blooming Keyframes */
        @keyframes bloomPetalOuter {
          0% {
            transform: scale(0.2) rotate(-20deg);
            opacity: 0.1;
          }
          40% {
            opacity: 0.8;
          }
          75% {
            transform: scale(1.08) rotate(3deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes bloomPetalMid {
          0% {
            transform: scale(0.15) rotate(25deg);
            opacity: 0.1;
          }
          50% {
            opacity: 0.85;
          }
          80% {
            transform: scale(1.06) rotate(-2deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes bloomPetalCore {
          0% {
            transform: scale(0.1) rotate(-35deg);
            opacity: 0.2;
          }
          60% {
            opacity: 0.9;
          }
          85% {
            transform: scale(1.05) rotate(2deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes goldenAuraExpand {
          0% {
            transform: translate(-50%, -50%) scale(0.4);
            opacity: 0.2;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.65;
          }
        }

        @keyframes fairyShimmer {
          0%, 100% {
            opacity: 0.15;
            transform: scale(0.6) translateY(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.25) translateY(-10px);
          }
        }

        @keyframes gentleBreathing {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-6px) scale(1.02);
          }
        }

        @keyframes dewdropGleam {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .animate-bloom-outer {
          transform-origin: 160px 145px;
          animation: bloomPetalOuter 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .animate-bloom-mid {
          transform-origin: 160px 145px;
          animation: bloomPetalMid 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
        }

        .animate-bloom-core {
          transform-origin: 160px 145px;
          animation: bloomPetalCore 2s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;
        }

        .animate-aura-expand {
          animation: goldenAuraExpand 2.2s ease-out forwards;
        }

        .animate-bouquet-breathe {
          animation: gentleBreathing 3.6s ease-in-out 2s infinite;
        }

        .animate-dewdrop {
          animation: dewdropGleam 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Fairy Dust Shimmer Particles Floating in the Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FAIRY_SPARKLES.map((sparkle) => (
          <div
            key={sparkle.id}
            style={{
              top: sparkle.top,
              left: sparkle.left,
              right: sparkle.right,
              animation: `fairyShimmer ${sparkle.duration} ease-in-out ${sparkle.delay} infinite`,
            }}
            className="absolute flex items-center justify-center pointer-events-none"
          >
            <Sparkles
              style={{
                width: sparkle.size,
                height: sparkle.size,
                color: sparkle.color,
                filter: `drop-shadow(0 0 6px ${sparkle.color})`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Modal Container */}
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-white/95 via-rose-50/95 to-pink-100/95 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(244,63,94,0.45)] border-2 border-rose-300/80 text-center overflow-hidden transform transition-all duration-500 scale-100 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luminous Golden / Rose Halo Aura */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-amber-300/35 via-rose-400/30 to-pink-300/35 rounded-full blur-3xl pointer-events-none animate-aura-expand" />

        {/* Close Button */}
        <button
          type="button"
          data-testid="close-bouquet-button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/80 hover:bg-rose-100 text-rose-500 flex items-center justify-center shadow-sm border border-rose-200 transition-all hover:scale-105 active:scale-95 cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 border border-rose-300/80 text-rose-800 text-xs font-bold tracking-wide uppercase shadow-sm mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Đóa Hoa Yêu Thương 20/10</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        </div>

        {/* Realistic Blooming Rose Bouquet Art */}
        <div
          data-testid="rose-bouquet-art"
          onClick={handleTouchBouquet}
          className={`relative cursor-pointer mx-auto my-0 select-none transition-transform duration-300 ${
            isWiggling ? 'scale-110 rotate-2' : 'hover:scale-105'
          } animate-bouquet-breathe`}
          title="Chạm vào bó hoa để nhận thêm yêu thương!"
        >
          <svg
            viewBox="0 0 320 320"
            className="w-60 h-60 sm:w-72 sm:h-72 mx-auto drop-shadow-[0_16px_32px_rgba(225,29,72,0.35)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Velvet Rose Deep Shadows */}
              <radialGradient id="velvetRuby" cx="45%" cy="40%" r="65%">
                <stop offset="0%" stopColor="#ff4d6d" />
                <stop offset="35%" stopColor="#e11d48" />
                <stop offset="70%" stopColor="#9f1239" />
                <stop offset="100%" stopColor="#4c0519" />
              </radialGradient>

              {/* Velvet Rose Bright Highlights */}
              <radialGradient id="velvetBright" cx="40%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#ff85a1" />
                <stop offset="45%" stopColor="#f43f5e" />
                <stop offset="85%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#881337" />
              </radialGradient>

              {/* Deep Shadow Petal */}
              <radialGradient id="velvetShadow" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#be123c" />
                <stop offset="60%" stopColor="#881337" />
                <stop offset="100%" stopColor="#4c0519" />
              </radialGradient>

              {/* Natural Leaf Gradient */}
              <linearGradient id="emeraldLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="35%" stopColor="#10b981" />
                <stop offset="80%" stopColor="#047857" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>

              {/* Luxury Champagne Wrapping Paper */}
              <linearGradient id="luxuryPaper" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#fce7f3" />
                <stop offset="70%" stopColor="#fbcfe8" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>

              {/* Golden Satin Ribbon */}
              <linearGradient id="goldenSatin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="80%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>

              {/* Dewdrop Specular Filter */}
              <radialGradient id="dewdropGrad" cx="35%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#fed7aa" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#be123c" stopOpacity="0.8" />
              </radialGradient>
            </defs>

            {/* Bouquet Wrapping - Back Fold Layers */}
            <g id="bouquet-paper">
              <polygon points="160,312 85,160 235,160" fill="#f472b6" opacity="0.65" />
              <polygon points="160,312 75,175 245,175" fill="url(#luxuryPaper)" />
              <polygon points="160,312 90,145 160,195" fill="#fbcfe8" opacity="0.85" />
              <polygon points="160,312 230,145 160,195" fill="#f472b6" opacity="0.75" />
              {/* Paper Crease Highlights */}
              <line x1="160" y1="195" x2="160" y2="310" stroke="#f472b6" strokeWidth="2" opacity="0.6" />
            </g>

            {/* Deep Foliage & Rose Leaves (Expanding with the bloom) */}
            <g id="bouquet-leaves" className="animate-bloom-outer">
              {/* Left Outer Leaf */}
              <path
                d="M95,165 C65,140 55,100 85,82 C110,105 115,135 95,165 Z"
                fill="url(#emeraldLeaf)"
              />
              <path
                d="M85,82 C92,105 96,125 95,165"
                stroke="#a7f3d0"
                strokeWidth="1.5"
                opacity="0.7"
              />

              {/* Right Outer Leaf */}
              <path
                d="M225,165 C255,140 265,100 235,82 C210,105 205,135 225,165 Z"
                fill="url(#emeraldLeaf)"
              />
              <path
                d="M235,82 C228,105 224,125 225,165"
                stroke="#a7f3d0"
                strokeWidth="1.5"
                opacity="0.7"
              />

              {/* Top Leaves Nestled in Roses */}
              <path
                d="M125,115 C110,75 130,50 148,68 C140,95 135,110 125,115 Z"
                fill="url(#emeraldLeaf)"
              />
              <path
                d="M195,115 C210,75 190,50 172,68 C180,95 185,110 195,115 Z"
                fill="url(#emeraldLeaf)"
              />
            </g>

            {/* Baby's Breath (Hoa baby trắng muốt lung linh) */}
            <g id="babys-breath" className="animate-bloom-outer" opacity="0.95">
              <circle cx="75" cy="115" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 3px #ffffff)" />
              <circle cx="68" cy="128" r="3.5" fill="#fff1f2" />
              <circle cx="86" cy="105" r="4" fill="#fef08a" />
              <circle cx="245" cy="115" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 3px #ffffff)" />
              <circle cx="252" cy="128" r="3.5" fill="#fff1f2" />
              <circle cx="234" cy="105" r="4" fill="#fef08a" />
              <circle cx="160" cy="55" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 3px #ffffff)" />
              <circle cx="146" cy="50" r="3.5" fill="#fef08a" />
              <circle cx="174" cy="50" r="3.5" fill="#ffe4e6" />
            </g>

            {/* SIDE ROSE 1: Left Blooming Rose */}
            <g id="left-rose" transform="translate(85, 115) scale(0.8)">
              {/* Outer blooming petals */}
              <g className="animate-bloom-outer">
                <circle cx="40" cy="40" r="38" fill="url(#velvetShadow)" />
                <path
                  d="M10,40 C8,18 28,8 48,12 C68,16 75,32 70,52 C65,68 45,74 25,65 C12,56 10,44 10,40 Z"
                  fill="url(#velvetRuby)"
                />
              </g>
              {/* Mid blooming petals */}
              <g className="animate-bloom-mid">
                <path
                  d="M20,36 C20,20 32,14 48,18 C62,22 66,36 60,48 C52,58 35,58 26,46 Z"
                  fill="url(#velvetBright)"
                />
              </g>
              {/* Core petals */}
              <g className="animate-bloom-core">
                <path
                  d="M28,32 C32,24 44,24 48,30 C52,36 46,44 38,42 C32,40 28,36 28,32 Z"
                  fill="#fda4af"
                />
              </g>
            </g>

            {/* SIDE ROSE 2: Right Blooming Rose */}
            <g id="right-rose" transform="translate(175, 115) scale(0.8)">
              {/* Outer blooming petals */}
              <g className="animate-bloom-outer">
                <circle cx="40" cy="40" r="38" fill="url(#velvetShadow)" />
                <path
                  d="M10,40 C8,18 28,8 48,12 C68,16 75,32 70,52 C65,68 45,74 25,65 C12,56 10,44 10,40 Z"
                  fill="url(#velvetRuby)"
                />
              </g>
              {/* Mid blooming petals */}
              <g className="animate-bloom-mid">
                <path
                  d="M20,36 C20,20 32,14 48,18 C62,22 66,36 60,48 C52,58 35,58 26,46 Z"
                  fill="url(#velvetBright)"
                />
              </g>
              {/* Core petals */}
              <g className="animate-bloom-core">
                <path
                  d="M28,32 C32,24 44,24 48,30 C52,36 46,44 38,42 C32,40 28,36 28,32 Z"
                  fill="#fda4af"
                />
              </g>
            </g>

            {/* TOP ROSE: Top Center Accent Rose */}
            <g id="top-rose" transform="translate(130, 75) scale(0.75)">
              <g className="animate-bloom-outer">
                <circle cx="40" cy="40" r="36" fill="url(#velvetShadow)" />
                <path
                  d="M12,40 C10,20 28,10 48,14 C66,18 72,34 68,52 C62,66 42,72 24,62 Z"
                  fill="url(#velvetRuby)"
                />
              </g>
              <g className="animate-bloom-mid">
                <path
                  d="M22,35 C22,22 34,16 48,20 C60,24 64,36 58,46 C50,56 34,54 26,44 Z"
                  fill="url(#velvetBright)"
                />
              </g>
              <g className="animate-bloom-core">
                <path
                  d="M30,32 C34,26 44,26 48,32 C50,38 42,42 38,40 Z"
                  fill="#fecdd3"
                />
              </g>
            </g>

            {/* MASTER CENTERPIECE ROSE: The Glorious Blooming Grand Rose */}
            <g id="center-grand-rose" transform="translate(115, 105) scale(1.1)">
              {/* LAYER 1: Deep Base & Wide Outermost Petals (Unfurling) */}
              <g className="animate-bloom-outer">
                <circle cx="40" cy="40" r="44" fill="url(#velvetShadow)" />

                {/* Left Outer Unfurled Petal with soft curve */}
                <path
                  d="M2,38 C-2,14 20,-2 46,2 C68,6 82,24 78,48 C74,68 50,78 26,72 C10,64 4,48 2,38 Z"
                  fill="url(#velvetRuby)"
                />

                {/* Right Outer Guard Petal */}
                <path
                  d="M8,44 C12,18 36,4 58,8 C80,12 86,34 80,56 C74,74 48,82 28,74 C14,64 8,50 8,44 Z"
                  fill="url(#velvetBright)"
                  opacity="0.9"
                />

                {/* Bottom Wide Cupped Petal */}
                <path
                  d="M14,48 C16,30 32,20 52,24 C70,28 76,46 68,62 C60,76 36,80 22,70 C14,62 14,52 14,48 Z"
                  fill="url(#velvetRuby)"
                />
              </g>

              {/* LAYER 2: Middle Velvet Petals (Unfolding in a spiral) */}
              <g className="animate-bloom-mid">
                {/* Mid Layer Petal A */}
                <path
                  d="M16,36 C16,18 32,10 50,16 C66,22 72,38 64,52 C56,64 36,66 24,52 C18,44 16,38 16,36 Z"
                  fill="url(#velvetBright)"
                />

                {/* Mid Layer Petal B (Interlocking spiral) */}
                <path
                  d="M22,34 C26,18 42,14 56,20 C70,26 70,44 60,56 C50,66 32,62 24,50 Z"
                  fill="url(#velvetRuby)"
                />

                {/* Glistening Dewdrop on Petal */}
                <g className="animate-dewdrop" transform="translate(62, 38)">
                  <circle cx="0" cy="0" r="3" fill="url(#dewdropGrad)" />
                  <circle cx="-0.8" cy="-0.8" r="1" fill="#ffffff" />
                </g>
              </g>

              {/* LAYER 3: Inner Petals & Radiant Blooming Core */}
              <g className="animate-bloom-core">
                {/* Inner Spiral Petal */}
                <path
                  d="M26,32 C30,20 44,18 52,24 C60,30 60,44 50,50 C40,56 30,50 26,40 Z"
                  fill="url(#velvetBright)"
                />

                {/* Heart Center Swirl */}
                <path
                  d="M32,30 C35,22 46,22 50,28 C54,34 48,42 42,42 C36,40 32,36 32,30 Z"
                  fill="#ff758f"
                />

                {/* Center Core Highlights */}
                <path
                  d="M36,28 C38,24 45,24 47,28 C49,32 45,36 41,35 C37,34 35,31 36,28 Z"
                  fill="#fecdd3"
                />

                {/* Tiny Specular Dewdrop Core */}
                <g className="animate-dewdrop" transform="translate(26, 48)">
                  <circle cx="0" cy="0" r="2" fill="url(#dewdropGrad)" />
                  <circle cx="-0.5" cy="-0.5" r="0.7" fill="#ffffff" />
                </g>
              </g>
            </g>

            {/* Golden Satin Ribbon Bow & Elegant Flowing Tails */}
            <g id="golden-ribbon" transform="translate(0, 10)">
              {/* Left Flowing Ribbon Tail */}
              <path
                d="M150,225 C138,255 120,280 108,305 C120,292 138,285 152,242 Z"
                fill="url(#goldenSatin)"
                filter="drop-shadow(0 4px 6px rgba(180,83,9,0.3))"
              />
              {/* Right Flowing Ribbon Tail */}
              <path
                d="M170,225 C182,255 200,280 212,305 C200,292 182,285 168,242 Z"
                fill="url(#goldenSatin)"
                filter="drop-shadow(0 4px 6px rgba(180,83,9,0.3))"
              />

              {/* Bow Left Satin Loop */}
              <ellipse
                cx="135"
                cy="225"
                rx="26"
                ry="15"
                transform="rotate(-22 135 225)"
                fill="url(#goldenSatin)"
              />
              <ellipse
                cx="135"
                cy="225"
                rx="15"
                ry="8"
                transform="rotate(-22 135 225)"
                fill="#92400e"
                opacity="0.45"
              />

              {/* Bow Right Satin Loop */}
              <ellipse
                cx="185"
                cy="225"
                rx="26"
                ry="15"
                transform="rotate(22 185 225)"
                fill="url(#goldenSatin)"
              />
              <ellipse
                cx="185"
                cy="225"
                rx="15"
                ry="8"
                transform="rotate(22 185 225)"
                fill="#92400e"
                opacity="0.45"
              />

              {/* Center Knot with Golden Highlight */}
              <circle
                cx="160"
                cy="225"
                r="11"
                fill="url(#goldenSatin)"
                stroke="#b45309"
                strokeWidth="1.5"
                filter="drop-shadow(0 2px 4px rgba(146,64,14,0.4))"
              />
              <circle cx="158" cy="222" r="3" fill="#ffffff" opacity="0.6" />
            </g>
          </svg>

          {/* Floating Heart Burst on Touch */}
          {loveCount > 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <span className="inline-block text-3xl animate-bounce drop-shadow-md">💖</span>
            </div>
          )}
        </div>

        {/* Romantic Greeting Tag Attached to the Bouquet */}
        <div className="relative mt-2 p-3.5 sm:p-4 bg-white/95 backdrop-blur-sm rounded-2xl border border-rose-200/90 shadow-sm">
          <h3
            id="rose-modal-title"
            className="font-heading text-lg sm:text-xl font-bold text-rose-900 leading-snug flex items-center justify-center gap-1.5"
          >
            <span>Thương tặng {recipientName}</span>
            <span className="text-rose-500 animate-pulse">🌹</span>
          </h3>

          <p className="font-sans text-xs sm:text-sm text-rose-700/90 mt-1 leading-relaxed">
            Nguyện chúc em luôn tươi tắn, xinh đẹp và rạng ngời như đóa hồng nhung đang hé nở!
          </p>

          {senderName && (
            <p className="font-handwriting text-base sm:text-lg text-rose-600 mt-1.5 font-bold tracking-wide">
              Yêu thương từ {senderName} 💌
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            data-testid="touch-flower-button"
            onClick={handleTouchBouquet}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-rose-100 hover:bg-rose-200/80 text-rose-700 border border-rose-300 font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>Chạm để gửi tim {loveCount > 0 ? `(${loveCount})` : ''} 💕</span>
          </button>

          <button
            type="button"
            data-testid="accept-flower-button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Em nhận hoa rồi 🥰</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
};
