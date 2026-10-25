import { Bell, Check, Copy, RefreshCw, Smartphone, X } from 'lucide-react';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';
import { notify, trackingUrl, useLiveStore } from '../core/live/LiveShare';

interface LiveShareModalProps {
  onClose: () => void;
}

const LiveShareModal: React.FC<LiveShareModalProps> = ({ onClose }) => {
  const { enabled, topic, telegramToken, telegramChatId, lastSentAt, lastError, setConfig } = useLiveStore();
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [tgToken, setTgToken] = useState(telegramToken);
  const [tgChat, setTgChat] = useState(telegramChatId);
  const url = trackingUrl(topic);

  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#0b1122', light: '#ffffff' } }).then(setQr).catch(() => setQr(''));
  }, [url]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const newLink = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    setConfig({ topic: 'nova-ofis-' + Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20) });
  };

  const saveTelegram = () => setConfig({ telegramToken: tgToken.trim(), telegramChatId: tgChat.trim() });

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 pointer-events-auto overflow-auto">
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
      <div className="relative w-full max-w-lg bg-white rounded-[32px] p-7 md:p-8 border border-violet-500/30 my-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-zinc-300 hover:text-zinc-600"><X size={20} /></button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center"><Smartphone size={20} className="text-white" /></div>
          <h2 className="text-2xl font-black text-darkDelegation tracking-tight">Telefondan Takip</h2>
        </div>
        <p className="text-sm text-zinc-500 mb-5 leading-relaxed">
          Ofisin anlık durumu gizli bir kanaldan telefonuna akar: görevler, onay bekleyen işler, çıktılar. Telefondan onay verebilir, düzelttirebilir ve lider ajana mesaj atabilirsin.
        </p>

        <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 mb-5 cursor-pointer">
          <div>
            <div className="text-sm font-black text-darkDelegation">Canlı takip {enabled ? 'açık' : 'kapalı'}</div>
            <div className="text-[11px] text-zinc-400">
              {enabled ? (lastError ? `Hata: ${lastError}` : lastSentAt ? `Son gönderim ${new Date(lastSentAt).toLocaleTimeString('tr-TR')}` : 'Bağlanıyor…') : 'Açınca ofis durumunu yayınlamaya başlar'}
            </div>
          </div>
          <input type="checkbox" checked={enabled} onChange={(e) => setConfig({ enabled: e.target.checked })} className="w-5 h-5 accent-violet-600" />
        </label>

        <div className="flex gap-5 items-center mb-5">
          {qr && <img src={qr} alt="Takip linki QR" className="w-36 h-36 rounded-2xl shrink-0" />}
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">Telefon linki</div>
            <div className="text-xs font-mono text-darkDelegation break-all mb-3">{url}</div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => copy(url, 'url')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase">
                {copied === 'url' ? <Check size={12} /> : <Copy size={12} />} Kopyala
              </button>
              <button onClick={newLink} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-zinc-500 text-[10px] font-black uppercase" title="Eski link artık çalışmaz">
                <RefreshCw size={12} /> Yeni link
              </button>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-zinc-400 mb-6">QR kodu telefon kamerasıyla okut. Linki kimseyle paylaşma; linki bilen ofisi görebilir ve onay verebilir.</p>

        <div className="border-t border-zinc-100 pt-5">
          <div className="flex items-center gap-2 mb-2"><Bell size={14} className="text-violet-500" /><span className="text-sm font-black text-darkDelegation">Anlık bildirim</span></div>
          <p className="text-[11px] text-zinc-500 mb-3 leading-relaxed">
            <b>ntfy</b> uygulamasını (Android/iOS, ücretsiz) kur, "+" ile şu kanala abone ol: onay beklendiğinde ve proje bittiğinde telefonun öter.
          </p>
          <button onClick={() => copy(`${topic}-bildirim`, 'topic')} className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-mono text-darkDelegation mb-4">
            {topic}-bildirim {copied === 'topic' ? <Check size={13} /> : <Copy size={13} />}
          </button>

          <details className="group">
            <summary className="text-[11px] font-black uppercase tracking-wider text-zinc-400 cursor-pointer mb-3">Telegram'a da gönder (isteğe bağlı)</summary>
            <div className="space-y-2">
              <input value={tgToken} onChange={(e) => setTgToken(e.target.value)} type="password" placeholder="Bot token (BotFather'dan)" className="w-full rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-2.5 text-xs font-mono" />
              <input value={tgChat} onChange={(e) => setTgChat(e.target.value)} placeholder="Chat ID" className="w-full rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-2.5 text-xs font-mono" />
              <button onClick={saveTelegram} className="w-full py-2.5 rounded-xl border border-zinc-200 text-[10px] font-black uppercase text-zinc-500">Telegram ayarını kaydet</button>
            </div>
          </details>

          <button
            disabled={!enabled}
            onClick={() => notify('🔔 Test bildirimi', 'Nova Ofis telefona bağlı. Bu mesajı gördüysen bildirimler çalışıyor.')}
            className="w-full mt-4 py-3 rounded-2xl bg-darkDelegation text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-40"
          >
            Test bildirimi gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveShareModal;
