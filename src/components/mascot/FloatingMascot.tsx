import React, { useState } from 'react';
import { RobotMascot } from './RobotMascot';
import { RobotMascotConfig, Category, TabItem } from '../../types';
import { soundEngine } from '../../services/soundEffects';
import { X, Sliders, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingMascotProps {
  config: RobotMascotConfig;
  activeCategory?: Category;
  activeTab?: TabItem;
  onOpenCustomizer: () => void;
  onToggleSound: () => void;
  onClose: () => void;
}

export const FloatingMascot: React.FC<FloatingMascotProps> = ({
  config,
  activeCategory,
  activeTab,
  onOpenCustomizer,
  onToggleSound,
  onClose,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [speechBubble, setSpeechBubble] = useState(true);

  if (!config.isEnabled || config.position !== 'floating') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Quick Options Menu */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 glass-panel rounded-2xl p-3 shadow-2xl border border-white/10 w-52 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <span className="text-xs font-semibold text-white">{config.name}</span>
              <span className="text-[10px] text-purple-400 font-mono">Companion</span>
            </div>

            <div className="text-[11px] text-slate-300">
              {activeCategory ? (
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: activeCategory.color }}
                  />
                  <span>{activeCategory.name}</span>
                </div>
              ) : (
                <span>Workspace Active</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <button
                onClick={onToggleSound}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1"
                title="Toggle robot sounds"
              >
                {config.soundEffectsEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              <button
                onClick={() => {
                  setExpanded(false);
                  onOpenCustomizer();
                }}
                className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-xs flex items-center gap-1 font-medium"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
                title="Hide floating dock"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Robot Avatar */}
      <div className="relative group">
        <RobotMascot
          skin={config.skin}
          expression={config.expression}
          category={config.autoMorphByCategory ? activeCategory : undefined}
          primaryColor={config.primaryColor}
          visorGlowColor={config.visorGlowColor}
          accentColor={config.accentColor}
          animationIntensity={config.animationIntensity}
          activeWebsiteName={activeTab ? new URL(activeTab.url || 'https://google.com').hostname : undefined}
          size="md"
          showSpeechBubble={speechBubble && !expanded}
          interactive={true}
          onClick={() => {
            setExpanded(!expanded);
            soundEngine.playChirp();
          }}
        />
      </div>
    </div>
  );
};
