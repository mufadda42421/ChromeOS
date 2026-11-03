import React, { useState } from 'react';
import { RobotMascot } from './RobotMascot';
import { RobotMascotConfig, Category, TabItem } from '../../types';
import { soundEngine } from '../../services/soundEffects';
import { Sparkles, MessageCircle, Sliders } from 'lucide-react';

interface MascotWidgetProps {
  config: RobotMascotConfig;
  activeCategory?: Category;
  activeTab?: TabItem;
  onOpenCustomizer: () => void;
  className?: string;
}

const ROBOT_PROVERBS = [
  'All systems nominal! Browsing flow optimized.',
  'Category auto-sync active. Tabs organized.',
  'Zero memory leaks detected. Workspace running clean.',
  'Ready to assist your browser session!',
  'Focus mode engaged. Distractions neutralized.',
  'Workspaces structured. High productivity ahead.',
];

export const MascotWidget: React.FC<MascotWidgetProps> = ({
  config,
  activeCategory,
  activeTab,
  onOpenCustomizer,
  className = '',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [pokeCount, setPokeCount] = useState(0);

  if (!config.isEnabled) return null;

  const currentSpeech = ROBOT_PROVERBS[quoteIndex % ROBOT_PROVERBS.length];

  const handlePoke = () => {
    soundEngine.playChirp();
    setPokeCount((c) => c + 1);
    setQuoteIndex((i) => i + 1);
  };

  return (
    <div
      className={`glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 transition-all hover:border-purple-500/30 ${className}`}
    >
      {/* Mascot & Speech */}
      <div className="flex items-center gap-3.5 min-w-0">
        <RobotMascot
          skin={config.skin}
          expression={config.expression}
          category={config.autoMorphByCategory ? activeCategory : undefined}
          primaryColor={config.primaryColor}
          visorGlowColor={config.visorGlowColor}
          accentColor={config.accentColor}
          animationIntensity={config.animationIntensity}
          activeWebsiteName={activeTab ? new URL(activeTab.url || 'https://google.com').hostname : undefined}
          size="sm"
          interactive={true}
          onClick={handlePoke}
        />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white tracking-wide">
              {config.name}
            </span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider"
              style={{
                color: activeCategory?.color || config.visorGlowColor,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              {activeCategory?.name || 'Workspace'}
            </span>
          </div>

          <p className="text-xs text-slate-300 truncate mt-0.5 max-w-[260px] md:max-w-xs font-sans">
            {config.speechBubbleEnabled ? currentSpeech : (activeTab?.title || 'System idle')}
          </p>
        </div>
      </div>

      {/* Quick Action buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handlePoke}
          title="Interact with mascot"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            setQuoteIndex((i) => i + 1);
          }}
          title="Cycle mascot insight"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenCustomizer();
          }}
          title="Open Mascot Customizer"
          className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
