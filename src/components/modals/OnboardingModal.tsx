import React, { useState } from 'react';
import { RobotMascotConfig, RobotSkin } from '../../types';
import { RobotMascot } from '../mascot/RobotMascot';
import { soundEngine } from '../../services/soundEffects';
import { Sparkles, ArrowRight, Check, Bot, Layers, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (customConfig?: Partial<RobotMascotConfig>) => void;
  initialMascotConfig: RobotMascotConfig;
}

const ONBOARDING_SKINS: { id: RobotSkin; label: string; desc: string }[] = [
  { id: 'cyber', label: 'Cyber', desc: 'Futuristic angular armor & ocular scanner' },
  { id: 'cute', label: 'Cute', desc: 'Friendly bubble head with blushing LED cheeks' },
  { id: 'minimal', label: 'Minimal', desc: 'Bauhaus floating orb & mono-eye aperture' },
  { id: 'neon', label: 'Neon', desc: 'Synthwave glowing wireframe & audio bars' },
  { id: 'retro', label: 'Retro', desc: 'Cathode tube CRT monitor & phosphor scanlines' },
  { id: 'professional', label: 'Pro', desc: 'Titanium shell & precision camera lens' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  initialMascotConfig,
}) => {
  const [step, setStep] = useState(1);
  const [selectedSkin, setSelectedSkin] = useState<RobotSkin>(initialMascotConfig.skin);
  const [mascotName, setMascotName] = useState(initialMascotConfig.name);

  if (!isOpen) return null;

  const handleNext = () => {
    soundEngine.playHappy();
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete({ skin: selectedSkin, name: mascotName });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Progress dots */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-wide">ChromeOS Setup</span>
            <span className="text-[10px] font-mono text-purple-400">Step {step} of 4</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  s === step ? 'w-6 bg-purple-500' : s < step ? 'bg-cyan-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-4 py-2 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 p-0.5 mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-[#0F1420] rounded-[22px] flex items-center justify-center">
                <span className="font-extrabold text-xl bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                  OS
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome to ChromeOS
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Transform your ordinary Google Chrome browsing experience into a futuristic, intelligent browser operating system with automatic tab categorization, dynamic robot mascots, and dedicated workspaces.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-4 text-left">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <Layers className="w-4 h-4 text-purple-400 mb-1" />
                <h4 className="text-xs font-bold text-white">Smart Tabs</h4>
                <p className="text-[10px] text-slate-400">Automatic category detection</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <Bot className="w-4 h-4 text-cyan-400 mb-1" />
                <h4 className="text-xs font-bold text-white">Robot Mascot</h4>
                <p className="text-[10px] text-slate-400">Morphs to active category</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                <h4 className="text-xs font-bold text-white">100% Local</h4>
                <p className="text-[10px] text-slate-400">Privacy-first storage</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MEET YOUR ROBOT MASCOT */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Meet Your Robot Mascot</h2>
              <p className="text-xs text-slate-400">
                Pick your initial theme skin and give your browser companion a name.
              </p>
            </div>

            {/* Live Mascot Avatar */}
            <div className="flex justify-center py-2">
              <RobotMascot
                skin={selectedSkin}
                expression="happy"
                primaryColor="#8B5CF6"
                visorGlowColor="#06B6D4"
                size="lg"
                interactive={true}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Companion Name
              </label>
              <input
                type="text"
                value={mascotName}
                onChange={(e) => setMascotName(e.target.value)}
                className="w-full bg-[#080B12] text-sm text-slate-100 p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Skin picker */}
            <div className="grid grid-cols-3 gap-2">
              {ONBOARDING_SKINS.map((sk) => {
                const isSelected = selectedSkin === sk.id;
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playMorph();
                      setSelectedSkin(sk.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/40 text-white ring-1 ring-purple-500'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{sk.label}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{sk.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: TAB CATEGORIZATION & WORKSPACES */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Intelligent Tab Workspaces</h2>
              <p className="text-xs text-slate-400">
                Whenever you open a website, ChromeOS analyzes its domain and groups it automatically.
              </p>
            </div>

            <div className="space-y-2.5 p-3 rounded-2xl bg-[#080B12] border border-white/5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                <span className="text-slate-300 font-mono">github.com</span>
                <span className="text-emerald-400 font-semibold">→ Development</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                <span className="text-slate-300 font-mono">chatgpt.com</span>
                <span className="text-purple-400 font-semibold">→ AI & Productivity</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                <span className="text-slate-300 font-mono">figma.com</span>
                <span className="text-pink-400 font-semibold">→ Design & Creativity</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                <span className="text-slate-300 font-mono">youtube.com</span>
                <span className="text-rose-400 font-semibold">→ Entertainment</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Your robot mascot will automatically adapt its visual armor and HUD to match the active tab's category!
            </p>
          </div>
        )}

        {/* STEP 4: READY TO BROWSE */}
        {step === 4 && (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-white">You're All Set!</h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your futuristic browser operating system is configured and ready. You can test tabs directly in the interactive workspace or export the full Chrome Extension to load into Google Chrome.
            </p>

            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs text-slate-300 text-left space-y-1 font-sans">
              <span className="font-bold text-white block">To Install in Chrome:</span>
              <p className="text-[11px] text-slate-400">
                Click <strong>"Export Extension"</strong> in the top bar anytime to download the ready-to-load Manifest V3 extension package.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg shadow-purple-500/20 transition-all"
          >
            <span>{step === 4 ? 'Launch ChromeOS' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
