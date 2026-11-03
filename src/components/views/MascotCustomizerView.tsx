import React, { useState } from 'react';
import { RobotMascotConfig, RobotSkin, RobotExpression, Category, MascotPosition } from '../../types';
import { RobotMascot } from '../mascot/RobotMascot';
import { soundEngine } from '../../services/soundEffects';
import {
  Bot,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  Palette,
  Eye,
  Activity,
  Check,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

interface MascotCustomizerViewProps {
  config: RobotMascotConfig;
  onUpdateConfig: (newConfig: RobotMascotConfig) => void;
  categories: Category[];
}

const SKINS: { id: RobotSkin; label: string; desc: string }[] = [
  { id: 'cyber', label: 'Cyber Robot', desc: 'Futuristic angular armor, scanning ocular visor, and sub-thruster chassis.' },
  { id: 'cute', label: 'Cute Robot', desc: 'Friendly rounded bubble head, blushing LED cheeks, and digital expressions.' },
  { id: 'minimal', label: 'Minimal Robot', desc: 'Bauhaus floating orb, spinning precision ring, and central aperture lens.' },
  { id: 'neon', label: 'Neon Robot', desc: 'Synthwave wireframe contours with high-contrast audio frequency bars.' },
  { id: 'retro', label: 'Retro Robot', desc: 'Cathode tube CRT monitor screen, phosphor raster scanlines, and mechanical dials.' },
  { id: 'professional', label: 'Professional Robot', desc: 'Titanium executive finish, multi-element camera lens, and subtle carbon fiber accents.' },
];

const EXPRESSIONS: { id: RobotExpression; label: string }[] = [
  { id: 'focused', label: 'Focused' },
  { id: 'happy', label: 'Happy' },
  { id: 'alert', label: 'Alert' },
  { id: 'chill', label: 'Chill' },
  { id: 'turbo', label: 'Turbo' },
  { id: 'zen', label: 'Zen' },
  { id: 'wink', label: 'Wink' },
];

const CHASSIS_COLORS = [
  '#8B5CF6',
  '#6366F1',
  '#3B82F6',
  '#06B6D4',
  '#10B981',
  '#EC4899',
  '#F43F5E',
  '#F59E0B',
  '#475569',
];

const VISOR_GLOW_COLORS = [
  '#06B6D4',
  '#A3E635',
  '#F43F5E',
  '#8B5CF6',
  '#F59E0B',
  '#38BDF8',
  '#22C55E',
];

export const MascotCustomizerView: React.FC<MascotCustomizerViewProps> = ({
  config,
  onUpdateConfig,
  categories,
}) => {
  const [localConfig, setLocalConfig] = useState<RobotMascotConfig>({ ...config });
  const [previewCategory, setPreviewCategory] = useState<Category | undefined>(categories[0]);
  const [testSpeech, setTestSpeech] = useState('All systems nominal. Ready to browse!');

  const update = (patch: Partial<RobotMascotConfig>) => {
    const next = { ...localConfig, ...patch };
    setLocalConfig(next);
    onUpdateConfig(next);
  };

  const handleSoundTest = () => {
    soundEngine.playHappy();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold font-mono">
              Signature Feature
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded">
              Interactive Bot
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Robot Mascot Customizer</h1>
          <p className="text-xs text-slate-400">
            Personalize your browser companion's skin, expressions, colors, and category morphing physics
          </p>
        </div>

        {/* Global Enable / Disable Mascot Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/10 hover:border-white/20">
            <input
              type="checkbox"
              checked={localConfig.isEnabled}
              onChange={(e) => update({ isEnabled: e.target.checked })}
              className="accent-purple-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-semibold text-white">Enable Mascot</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Live Holo-Stage */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col items-center justify-between sticky top-20">
          <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 text-xs">
            <span className="font-semibold text-white">Live Holo-Stage</span>
            <span className="font-mono text-[11px] text-purple-400">{localConfig.skin} skin</span>
          </div>

          {/* Interactive Mascot Rendering Canvas */}
          <div className="py-10 flex flex-col items-center justify-center relative w-full">
            {/* Stage background glow */}
            <div
              className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
              style={{ backgroundColor: localConfig.visorGlowColor }}
            />

            <RobotMascot
              skin={localConfig.skin}
              expression={localConfig.expression}
              category={localConfig.autoMorphByCategory ? previewCategory : undefined}
              primaryColor={localConfig.primaryColor}
              visorGlowColor={localConfig.visorGlowColor}
              accentColor={localConfig.accentColor}
              animationIntensity={localConfig.animationIntensity}
              size="xl"
              showSpeechBubble={localConfig.speechBubbleEnabled}
              speechText={testSpeech}
              interactive={true}
              onClick={() => {
                soundEngine.playChirp();
                setTestSpeech(
                  localConfig.autoMorphByCategory && previewCategory
                    ? `Morph: ${previewCategory.name} activated!`
                    : 'System optimized and running smooth.'
                );
              }}
            />

            {/* Stage Pedestal */}
            <div className="w-40 h-3 rounded-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mt-4 blur-[1px]" />
            <div className="w-24 h-1 rounded-full bg-cyan-400/40 mt-0.5 blur-[1px]" />
          </div>

          {/* Test Live Category Morphing Simulator */}
          <div className="w-full space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Test Category Morph
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Simulate tab switch
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {categories.slice(0, 5).map((cat) => {
                const isSelected = previewCategory?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundEngine.playMorph();
                      setPreviewCategory(cat);
                      setTestSpeech(`${cat.name} Mode Engaged`);
                    }}
                    className={`px-2 py-1.5 rounded-xl text-[10px] font-medium truncate border transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-600/30 text-white shadow-sm'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {cat.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Interactive Audio Synthesizer Test */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400">Audio Synthesizer</span>
              <button
                onClick={handleSoundTest}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Play Robotic Chirp
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Mascot Identity & Skin */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              1. Mascot Identity & Theme Skins
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Robot Mascot Name
              </label>
              <input
                type="text"
                value={localConfig.name}
                onChange={(e) => update({ name: e.target.value })}
                className="w-full bg-[#080B12] text-sm text-slate-100 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {SKINS.map((skin) => {
                const isSelected = localConfig.skin === skin.id;
                return (
                  <div
                    key={skin.id}
                    onClick={() => {
                      soundEngine.playMorph();
                      update({ skin: skin.id });
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/30 shadow-md ring-1 ring-purple-500/50'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{skin.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{skin.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Expressions & Mood */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              2. Expressions & Facial State
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EXPRESSIONS.map((expr) => {
                const isSelected = localConfig.expression === expr.id;
                return (
                  <button
                    key={expr.id}
                    onClick={() => {
                      soundEngine.playClick();
                      update({ expression: expr.id });
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm'
                        : 'bg-white/[0.02] text-slate-400 border-white/5 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {expr.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Colors & Optical Visor */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              3. Chassis & Visor Colors
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Primary Chassis Tone
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {CHASSIS_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      soundEngine.playClick();
                      update({ primaryColor: col });
                    }}
                    className={`w-7 h-7 rounded-lg transition-transform ${
                      localConfig.primaryColor === col ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Visor Glow Color
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {VISOR_GLOW_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      soundEngine.playClick();
                      update({ visorGlowColor: col });
                    }}
                    className={`w-7 h-7 rounded-lg transition-transform ${
                      localConfig.visorGlowColor === col ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Behavior & Animation Intensity */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              4. Dynamics, Speech & Physics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Idle Float Physics
                </label>
                <select
                  value={localConfig.animationIntensity}
                  onChange={(e) => update({ animationIntensity: e.target.value as any })}
                  className="w-full bg-[#080B12] text-xs text-slate-200 p-2.5 rounded-xl border border-white/10 focus:outline-none"
                >
                  <option value="calm">Calm (Subtle Hover)</option>
                  <option value="dynamic">Dynamic (Standard Reactive)</option>
                  <option value="hyper">Hyper (Energized)</option>
                  <option value="off">Static (No Animation)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mascot Display Position
                </label>
                <select
                  value={localConfig.position}
                  onChange={(e) => update({ position: e.target.value as MascotPosition })}
                  className="w-full bg-[#080B12] text-xs text-slate-200 p-2.5 rounded-xl border border-white/10 focus:outline-none"
                >
                  <option value="tabbar">Top Navigation Bar</option>
                  <option value="floating">Floating Dock (Bottom Right)</option>
                  <option value="sidebar">Sidebar Companion</option>
                  <option value="dashboard">Dashboard Only</option>
                </select>
              </div>
            </div>

            {/* Checkbox Features */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.autoMorphByCategory}
                  onChange={(e) => update({ autoMorphByCategory: e.target.checked })}
                  className="accent-purple-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Automatic Category Morphing
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Mascot changes its appearance, visor, and mood dynamically when switching website categories
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.speechBubbleEnabled}
                  onChange={(e) => update({ speechBubbleEnabled: e.target.checked })}
                  className="accent-purple-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Interactive Speech Bubbles
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Display situational suggestions, active website announcements, and tips
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.soundEffectsEnabled}
                  onChange={(e) => {
                    const nextVal = e.target.checked;
                    soundEngine.setEnabled(nextVal);
                    update({ soundEffectsEnabled: nextVal });
                  }}
                  className="accent-purple-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Robotic Sound Effects & Chirps
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Play authentic futuristic Web Audio chirps and category morph sweeps
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
