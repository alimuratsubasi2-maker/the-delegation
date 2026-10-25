import { Brain, Eye, EyeOff, Loader2, X } from 'lucide-react';
import React, { useState } from 'react';
import { connectObsidian, DEFAULT_OBSIDIAN_URL, useObsidianStore } from '../core/obsidian/ObsidianBrain';

interface ObsidianModalProps {
  onClose: () => void;
}

const ObsidianModal: React.FC<ObsidianModalProps> = ({ onClose }) => {
  const { url, apiKey, status, error, projectCount, noteCount, lastSavedPath, setConfig } = useObsidianStore();
  const [urlInput, setUrlInput] = useState(url || DEFAULT_OBSIDIAN_URL);
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  const handleConnect = async () => {
    setConfig({ url: urlInput.trim() || DEFAULT_OBSIDIAN_URL, apiKey: keyInput.trim() });
    await connectObsidian();
  };

  const handleDisconnect = () => {
    setConfig({ url: urlInput.trim() || DEFAULT_OBSIDIAN_URL, apiKey: '' });
    setKeyInput('');
    useObsidianStore.setState({ status: 'disconnected', overview: '', projectCount: 0, noteCount: 0 });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 pointer-events-auto overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(124,58,237,0.35)] p-8 md:p-10 border border-violet-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-300 hover:text-zinc-600 transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
            <Brain size={20} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-darkDelegation tracking-tight">Obsidian Beyni</h2>
        </div>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          Ofis, Obsidian kasandaki tüm projeleri ve akıl haritalarını okuyup her konuşmada ilgili notları ajanlara verir.
          Notların sadece senin bilgisayarından okunur; ilgili parçalar senin Gemini anahtarınla Google'a gönderilir.
        </p>

        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Adres</label>
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-6 py-3 mb-4 text-sm font-mono focus:outline-none focus:border-violet-300"
        />

        <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Local REST API anahtarı</label>
        <div className="relative mb-2">
          <input
            type={showKey ? 'text' : 'password'}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Obsidian → Ayarlar → Local REST API → API Key"
            className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl px-6 py-3 pr-14 text-sm font-mono placeholder:font-sans placeholder:text-zinc-300 focus:outline-none focus:border-violet-300"
          />
          <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600">
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="min-h-[44px] my-4 text-xs leading-relaxed">
          {status === 'connected' && (
            <div className="px-4 py-3 rounded-2xl bg-violet-50 text-violet-700 font-semibold">
              ✓ Bağlandı — {projectCount} proje, {noteCount} not ofisin beynine yüklendi.
              <div className="font-normal mt-1">Biten her proje otomatik olarak <b>Nova Ofis Ciktilari</b> klasörüne not olarak kaydedilir.</div>
              {lastSavedPath && <div className="font-normal mt-1 break-all">Son kayıt: {lastSavedPath}</div>}
            </div>
          )}
          {status === 'error' && (
            <div className="px-4 py-3 rounded-2xl bg-red-50 text-red-600">
              {error}. Obsidian açık mı ve Local REST API eklentisinde "Enable Non-encrypted (HTTP) Server" açık mı?
            </div>
          )}
          {status === 'connecting' && (
            <div className="flex items-center gap-2 px-4 py-3 text-zinc-500"><Loader2 size={14} className="animate-spin" /> Kasa okunuyor…</div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDisconnect}
            disabled={!apiKey}
            className="flex-1 py-3 rounded-2xl border border-zinc-100 text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-red-500 disabled:opacity-40"
          >
            Bağlantıyı kes
          </button>
          <button
            onClick={handleConnect}
            disabled={!keyInput.trim() || status === 'connecting'}
            className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-violet-500/30 disabled:opacity-40"
          >
            Bağlan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObsidianModal;
