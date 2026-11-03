import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RobotSkin, RobotExpression, Category } from '../../types';
import { soundEngine } from '../../services/soundEffects';

interface RobotMascotProps {
  skin?: RobotSkin;
  expression?: RobotExpression;
  category?: Category;
  primaryColor?: string;
  visorGlowColor?: string;
  accentColor?: string;
  activeWebsiteName?: string;
  animationIntensity?: 'calm' | 'dynamic' | 'hyper' | 'off';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSpeechBubble?: boolean;
  speechText?: string;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({
  skin = 'cyber',
  expression = 'focused',
  category,
  primaryColor = '#8B5CF6',
  visorGlowColor = '#06B6D4',
  accentColor = '#A3E635',
  activeWebsiteName,
  animationIntensity = 'dynamic',
  size = 'md',
  showSpeechBubble = false,
  speechText,
  interactive = true,
  onClick,
  className = '',
}) => {
  const [isReacting, setIsReacting] = useState(false);
  const [blink, setBlink] = useState(false);

  // Trigger occasional natural blink
  React.useEffect(() => {
    if (animationIntensity === 'off') return;
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800);
    return () => clearInterval(interval);
  }, [animationIntensity]);

  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactive) return;

    setIsReacting(true);
    soundEngine.playChirp();
    setTimeout(() => setIsReacting(false), 500);

    if (onClick) onClick();
  };

  // Dimensional scale mapping
  const sizeMap = {
    sm: { width: 44, height: 44, svgSize: 100 },
    md: { width: 72, height: 72, svgSize: 120 },
    lg: { width: 110, height: 110, svgSize: 140 },
    xl: { width: 180, height: 180, svgSize: 160 },
  };

  const { width, height } = sizeMap[size];

  // Animation variants
  const floatDuration =
    animationIntensity === 'calm' ? 4 : animationIntensity === 'hyper' ? 1.5 : 2.5;

  const getOverlay = () => {
    if (!category) return null;
    return category.mascotOverlay || 'default';
  };

  const overlayType = getOverlay();

  // Dynamic context speech bubble content
  const defaultSpeech =
    speechText ||
    (category
      ? `${category.name} active${activeWebsiteName ? ` on ${activeWebsiteName}` : ''}`
      : 'Ready to browse');

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            className="absolute -top-11 z-20 whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium text-slate-100 shadow-xl border border-white/10 pointer-events-none"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-ping"
                style={{ backgroundColor: visorGlowColor }}
              />
              <span>{defaultSpeech}</span>
            </div>
            {/* Arrow */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-white/10"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Robot Avatar Body */}
      <motion.div
        animate={
          animationIntensity !== 'off'
            ? {
                y: isReacting ? [0, -12, 0] : [0, -6, 0],
                rotate: isReacting ? [-4, 4, 0] : 0,
                scale: isReacting ? 1.08 : 1,
              }
            : undefined
        }
        transition={{
          y: isReacting
            ? { duration: 0.4, ease: 'easeOut' }
            : { duration: floatDuration, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 0.4 },
          scale: { duration: 0.25 },
        }}
        onClick={handleMascotClick}
        className={`cursor-pointer transition-transform duration-200 group relative flex items-center justify-center`}
        style={{ width, height }}
      >
        {/* Glow halo */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30 transition-all duration-500 group-hover:opacity-60"
          style={{ backgroundColor: visorGlowColor }}
        />

        {/* SVG Drawing Canvas */}
        <svg
          viewBox="0 0 160 160"
          width="100%"
          height="100%"
          className="overflow-visible filter drop-shadow-md"
        >
          <defs>
            {/* Visor Linear Gradient */}
            <linearGradient id={`visor-grad-${skin}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={visorGlowColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.8" />
            </linearGradient>

            {/* Chassis Gradient */}
            <linearGradient id={`chassis-grad-${skin}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Cyber Armor Edge */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* SKIN 1: CYBER ROBOT */}
          {skin === 'cyber' && (
            <g>
              {/* Antenna / Comm dishes */}
              <line x1="80" y1="36" x2="80" y2="18" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
              <circle cx="80" cy="16" r="5" fill={visorGlowColor} filter="url(#neon-glow)" />
              <path d="M42 45 L28 35" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />
              <path d="M118 45 L132 35" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" />

              {/* Head Shell */}
              <polygon
                points="40,46 120,46 130,86 116,114 44,114 30,86"
                fill="url(#chassis-grad-cyber)"
                stroke={primaryColor}
                strokeWidth="2.5"
              />

              {/* Ear Pods */}
              <rect x="22" y="60" width="10" height="26" rx="3" fill="#1E293B" stroke={primaryColor} strokeWidth="1.5" />
              <rect x="128" y="60" width="10" height="26" rx="3" fill="#1E293B" stroke={primaryColor} strokeWidth="1.5" />

              {/* Futuristic Visor Mask */}
              <polygon
                points="46,58 114,58 120,86 108,98 52,98 40,86"
                fill="#05070C"
                stroke={visorGlowColor}
                strokeWidth="1.5"
              />

              {/* Render Expressive Eyes / HUD */}
              <CyberVisorEye
                expression={expression}
                blink={blink}
                glowColor={visorGlowColor}
                accentColor={accentColor}
              />

              {/* Chest & Sub-thruster base */}
              <path
                d="M54 116 L106 116 L98 142 L62 142 Z"
                fill="#1E293B"
                stroke={primaryColor}
                strokeWidth="2"
              />
              <circle cx="80" cy="128" r="4" fill={accentColor} />
            </g>
          )}

          {/* SKIN 2: CUTE ROBOT */}
          {skin === 'cute' && (
            <g>
              {/* Cute Ball Antenna */}
              <path d="M80 34 Q80 20 86 16" stroke={primaryColor} strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx="88" cy="14" r="7" fill={accentColor} filter="url(#neon-glow)" />

              {/* Rounded Head */}
              <rect
                x="32"
                y="36"
                width="96"
                height="80"
                rx="38"
                fill="#1E2433"
                stroke={primaryColor}
                strokeWidth="2.5"
              />

              {/* Cheek Blushes */}
              <ellipse cx="48" cy="84" rx="7" ry="4" fill="#F43F5E" opacity="0.6" />
              <ellipse cx="112" cy="84" rx="7" ry="4" fill="#F43F5E" opacity="0.6" />

              {/* Cute Digital Eyes */}
              <CuteEyes
                expression={expression}
                blink={blink}
                eyeColor={visorGlowColor}
              />

              {/* Smiling or expressive mouth */}
              <CuteMouth expression={expression} strokeColor={visorGlowColor} />

              {/* Cute feet / base */}
              <ellipse cx="60" cy="122" rx="10" ry="5" fill="#0F172A" stroke={primaryColor} strokeWidth="2" />
              <ellipse cx="100" cy="122" rx="10" ry="5" fill="#0F172A" stroke={primaryColor} strokeWidth="2" />
            </g>
          )}

          {/* SKIN 3: MINIMAL ROBOT */}
          {skin === 'minimal' && (
            <g>
              {/* Bauhaus Monolith / Floating Sphere */}
              <circle cx="80" cy="80" r="48" fill="#181E29" stroke="#334155" strokeWidth="2" />
              {/* Outer Precision Ring */}
              <circle
                cx="80"
                cy="80"
                r="56"
                fill="none"
                stroke={primaryColor}
                strokeWidth="1.5"
                strokeDasharray="4 8"
                className="animate-spin origin-center"
                style={{ animationDuration: '24s' }}
              />

              {/* Central Mono-Eye / Aperture */}
              <circle cx="80" cy="80" r="24" fill="#0B0F17" stroke={visorGlowColor} strokeWidth="2" />
              <circle
                cx="80"
                cy="80"
                r={blink ? 3 : 12}
                fill={visorGlowColor}
                filter="url(#neon-glow)"
              />
              <circle cx="84" cy="76" r="3" fill="#FFFFFF" opacity="0.8" />
            </g>
          )}

          {/* SKIN 4: NEON ROBOT */}
          {skin === 'neon' && (
            <g>
              {/* Synthwave Wireframe Head */}
              <rect
                x="34"
                y="38"
                width="92"
                height="78"
                rx="14"
                fill="#0B0D14"
                stroke={primaryColor}
                strokeWidth="2.5"
                filter="url(#neon-glow)"
              />
              {/* Neon Grid Visor */}
              <rect x="42" y="52" width="76" height="42" rx="8" fill="#05070A" stroke={visorGlowColor} strokeWidth="1.5" />

              {/* Pulsing Audio Bar Eyes */}
              <g transform="translate(54, 62)">
                <rect x="0" y={blink ? 12 : 2} width="4" height={blink ? 2 : 18} rx="2" fill={visorGlowColor} />
                <rect x="8" y={blink ? 12 : 0} width="4" height={blink ? 2 : 22} rx="2" fill={accentColor} />
                <rect x="16" y={blink ? 12 : 4} width="4" height={blink ? 2 : 14} rx="2" fill={visorGlowColor} />

                {/* Right side */}
                <rect x="32" y={blink ? 12 : 4} width="4" height={blink ? 2 : 14} rx="2" fill={visorGlowColor} />
                <rect x="40" y={blink ? 12 : 0} width="4" height={blink ? 2 : 22} rx="2" fill={accentColor} />
                <rect x="48" y={blink ? 12 : 2} width="4" height={blink ? 2 : 18} rx="2" fill={visorGlowColor} />
              </g>

              {/* Lower neon chassis line */}
              <line x1="50" y1="126" x2="110" y2="126" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {/* SKIN 5: RETRO ROBOT */}
          {skin === 'retro' && (
            <g>
              {/* Copper rabbit ear antennas */}
              <line x1="72" y1="36" x2="56" y2="16" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
              <line x1="88" y1="36" x2="104" y2="16" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
              <circle cx="54" cy="14" r="4" fill="#F59E0B" />
              <circle cx="106" cy="14" r="4" fill="#F59E0B" />

              {/* CRT Monitor Head */}
              <rect
                x="32"
                y="36"
                width="96"
                height="82"
                rx="16"
                fill="#242C38"
                stroke="#64748B"
                strokeWidth="3"
              />

              {/* CRT Curved Screen with scanlines */}
              <rect x="42" y="46" width="76" height="52" rx="10" fill="#0A1017" stroke="#334155" strokeWidth="1.5" />

              {/* Scanlines */}
              <line x1="44" y1="56" x2="116" y2="56" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="44" y1="68" x2="116" y2="68" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="44" y1="80" x2="116" y2="80" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 2" />

              {/* Pixel phosphor eye dots */}
              <rect x="56" y={blink ? 70 : 62} width="12" height={blink ? 3 : 12} fill="#22C55E" />
              <rect x="92" y={blink ? 70 : 62} width="12" height={blink ? 3 : 12} fill="#22C55E" />

              {/* Mechanical dials on side */}
              <circle cx="122" cy="72" r="3" fill="#D97706" />
              <circle cx="122" cy="82" r="3" fill="#94A3B8" />
            </g>
          )}

          {/* SKIN 6: PROFESSIONAL ROBOT */}
          {skin === 'professional' && (
            <g>
              {/* Executive Matte Titanium Shell */}
              <polygon
                points="48,40 112,40 126,80 116,116 44,116 34,80"
                fill="#1E2430"
                stroke="#475569"
                strokeWidth="2"
              />

              {/* Carbon fiber bevel accent */}
              <polygon points="56,46 104,46 114,78 106,106 54,106 46,78" fill="#131720" />

              {/* Precision Optical Camera Lens */}
              <circle cx="80" cy="78" r="22" fill="#0A0E17" stroke={primaryColor} strokeWidth="2" />
              <circle cx="80" cy="78" r="14" fill="#020617" stroke={visorGlowColor} strokeWidth="1.5" />
              <circle cx="80" cy="78" r={blink ? 2 : 7} fill={visorGlowColor} filter="url(#neon-glow)" />

              {/* Gold/Slate executive badge */}
              <rect x="70" y="108" width="20" height="4" rx="2" fill="#E2E8F0" />
            </g>
          )}

          {/* DYNAMIC CATEGORY MORPHING OVERLAYS */}
          {/* AI Category: Neural Halo */}
          {overlayType === 'ai' && (
            <g className="origin-center animate-pulse">
              <ellipse cx="80" cy="24" rx="34" ry="10" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="6 4" />
              <circle cx="56" cy="22" r="2.5" fill="#C084FC" />
              <circle cx="80" cy="14" r="3" fill="#E879F9" filter="url(#neon-glow)" />
              <circle cx="104" cy="22" r="2.5" fill="#C084FC" />
            </g>
          )}

          {/* Dev Category: Code stream & bracket ears */}
          {overlayType === 'dev' && (
            <g>
              <text x="18" y="78" fill="#10B981" fontSize="16" fontWeight="bold" fontFamily="monospace">
                &lt;
              </text>
              <text x="132" y="78" fill="#10B981" fontSize="16" fontWeight="bold" fontFamily="monospace">
                /&gt;
              </text>
            </g>
          )}

          {/* Design Category: Stylus / Creative Prismatic beam */}
          {overlayType === 'design' && (
            <g>
              <line x1="126" y1="28" x2="142" y2="12" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
              <polygon points="144,10 148,16 138,20" fill="#F43F5E" />
              <circle cx="34" cy="26" r="4" fill="#F59E0B" />
              <circle cx="44" cy="20" r="3" fill="#EC4899" />
              <circle cx="54" cy="24" r="3" fill="#8B5CF6" />
            </g>
          )}

          {/* Entertainment Category: Neon Headphones */}
          {overlayType === 'entertainment' && (
            <g>
              <path d="M26 76 C24 38 136 38 134 76" fill="none" stroke="#F43F5E" strokeWidth="4" strokeLinecap="round" />
              <rect x="20" y="66" width="10" height="24" rx="4" fill="#FB7185" />
              <rect x="130" y="66" width="10" height="24" rx="4" fill="#FB7185" />
            </g>
          )}

          {/* Shopping Category: Cart HUD Tag */}
          {overlayType === 'shopping' && (
            <g>
              <circle cx="128" cy="38" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
              <path d="M124 38 L132 38 M128 34 L128 42" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}

          {/* Communication: Radar Sweep Rings */}
          {overlayType === 'communication' && (
            <g className="origin-center">
              <path d="M118 42 Q132 54 132 76" fill="none" stroke="#06B6D4" strokeWidth="2" strokeDasharray="3 3" />
              <path d="M124 34 Q142 50 142 80" fill="none" stroke="#06B6D4" strokeWidth="1.5" opacity="0.6" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};

// Sub-component: Cyber visor eyes
function CyberVisorEye({
  expression,
  blink,
  glowColor,
  accentColor,
}: {
  expression: RobotExpression;
  blink: boolean;
  glowColor: string;
  accentColor: string;
}) {
  if (blink) {
    return (
      <g>
        <line x1="54" y1="76" x2="72" y2="76" stroke={glowColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="88" y1="76" x2="106" y2="76" stroke={glowColor} strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }

  switch (expression) {
    case 'happy':
      return (
        <g>
          <path d="M54 78 Q63 68 72 78" stroke={glowColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M88 78 Q97 68 106 78" stroke={glowColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'alert':
      return (
        <g>
          <polygon points="63,66 72,82 54,82" fill={accentColor} />
          <polygon points="97,66 106,82 88,82" fill={accentColor} />
        </g>
      );
    case 'turbo':
      return (
        <g>
          <path d="M52 74 L74 68 L64 84 Z" fill={glowColor} />
          <path d="M86 74 L108 68 L98 84 Z" fill={glowColor} />
        </g>
      );
    case 'wink':
      return (
        <g>
          <circle cx="63" cy="74" r="6" fill={glowColor} />
          <path d="M88 75 Q97 81 106 75" stroke={glowColor} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'zen':
      return (
        <g>
          <line x1="54" y1="74" x2="72" y2="74" stroke={glowColor} strokeWidth="3" strokeLinecap="round" />
          <line x1="88" y1="74" x2="106" y2="74" stroke={glowColor} strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'focused':
    default:
      return (
        <g>
          <rect x="54" y="68" width="18" height="12" rx="4" fill={glowColor} />
          <rect x="88" y="68" width="18" height="12" rx="4" fill={glowColor} />
          <line x1="54" y1="74" x2="106" y2="74" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />
        </g>
      );
  }
}

// Sub-component: Cute digital eyes
function CuteEyes({
  expression,
  blink,
  eyeColor,
}: {
  expression: RobotExpression;
  blink: boolean;
  eyeColor: string;
}) {
  if (blink) {
    return (
      <g>
        <line x1="52" y1="72" x2="68" y2="72" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="92" y1="72" x2="108" y2="72" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }

  if (expression === 'happy') {
    return (
      <g>
        <path d="M52 74 Q60 64 68 74" stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M92 74 Q100 64 108 74" stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    );
  }

  return (
    <g>
      <circle cx="60" cy="70" r="9" fill={eyeColor} />
      <circle cx="63" cy="67" r="3" fill="#FFFFFF" />
      <circle cx="100" cy="70" r="9" fill={eyeColor} />
      <circle cx="103" cy="67" r="3" fill="#FFFFFF" />
    </g>
  );
}

function CuteMouth({ expression, strokeColor }: { expression: RobotExpression; strokeColor: string }) {
  if (expression === 'happy') {
    return (
      <path d="M74 88 Q80 94 86 88" stroke={strokeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    );
  }
  return (
    <path d="M76 88 Q80 90 84 88" stroke={strokeColor} strokeWidth="2" fill="none" strokeLinecap="round" />
  );
}
