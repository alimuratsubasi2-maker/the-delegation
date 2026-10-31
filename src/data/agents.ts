import { USER_COLOR } from '../theme/brand';
import { DEFAULT_MODELS } from '../core/llm/constants';

export const USER_ID = 'user';
export const USER_NAME = 'User';
export const MAX_AGENTS = 13;
export { USER_COLOR };
export const DEFAULT_AGENTIC_SET_ID = 'single-agent';
/** Bump whenever built-in teams change so stale saved copies are discarded. */
export const BUILT_IN_TEAMS_VERSION = 8;
export interface AgentNode {
  id: string;
  index: number;
  name: string;
  description: string;
  color: string;
  model: string;
  humanInTheLoop?: boolean;
  position?: { x: number; y: number };
  subagents?: AgentNode[];
}

export type OutputType = 'text' | 'image' | 'music' | 'video';
export interface AgenticSystem {
  id: string;
  teamName: string;
  teamType: string;
  teamDescription: string;
  color: string;
  outputType: OutputType;
  outputModel: string;
  outputAutoApprove?: boolean;
  user: {
    index: number;
    model: string;
    position?: { x: number; y: number };
  };
  leadAgent: AgentNode;
}

export const AGENTIC_SETS: AgenticSystem[] = [
  {
    id: 'nova-dijital',
    teamName: 'Nova Dijital',
    teamType: 'Dijital Ajans',
    teamDescription: 'NovaDijitalTR: web sitesi, mobil uygulama, AI video reklam ve içerik üreticilerine video edit hizmeti veren ajans.',
    color: '#7C3AED',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: true,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'nova-ceo',
      index: 1,
      name: 'Ajans Müdürü',
      description: 'Müşteri talebini web/uygulama, AI reklam ve video edit ekiplerine böler, TL fiyat ve teslim planını çıkarır, son teslimi onaylar. İlk görevi her zaman Obsidian’a verir: kullanıcının geçmiş projelerinden ilgili bağlamı toplatır. Web sitesi, uygulama, ödeme/abonelik, form, kullanıcı içeriği veya e-posta içeren HER işte son teslimden önce Hukuk Uyum Denetçisi’ne kontrol görevi verir; denetçinin eklediği yasal metinler ve düzeltmeler son teslime girer.',
      color: '#7C3AED',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'hukuk-nova-dijital',
          index: 13,
          name: 'Hukuk Uyum Denetçisi',
          description: 'Türkiye hukuk uyum denetçisi (kontrol listesi uygular, hukuki görüş vermez). Ekibin yaptığı her web sitesi, uygulama ve reklam işini teslimden önce 6 başlıkta kontrol eder ve EKSİKLERİ TESLİME EKLER. 1) Ödeme/abonelik (6502, Mesafeli Sözleşmeler Yönetmeliği): toplam fiyat, yenileme periyodu, otomatik yenileme, iptal yolu, cayma hakkı, net “ödemeyi onaylıyorum” adımı, deneme bitince ücret çekileceği uyarısı; gizli/küçük puntolu şart yok. 2) Tanıtım e-postaları (6563): onay, gönderen kimliği ve iletişim adresi, çalışan ret/çıkış yolu. 3) Kullanıcı yüklemeleri (5846 FSEK): hak sahibi bildirimi ve içerik kaldırma mekanizması. 4) Kullanıcı içeriği (5651): şikâyet/bildirim kanalı, kaldırma süreci, görünür yer sağlayıcı ve iletişim bilgisi, log saklama kararı. 5) KVKK aydınlatma metni (m.10): toplanan veriler, amaç, kimlerle paylaşıldığı, saklama süresi, kullanıcı hakları; ilk kullanımdan önce gösterilir, mağaza gizlilik politikasıyla aynı. 6) Yurt dışına veri ve harici kaynaklar (KVKK m.9/12): Google Fonts/CDN, analitik, hata izleme, reklam/takip SDK’ları, oturum kaydı, harici betik/görsel, e-posta ve ödeme sağlayıcıları; hangi veri gidiyor, çerez onayı var mı, aydınlatmada yurt dışı aktarım dayanağı yazıyor mu; parola/form girdisini kaydeden araç olmamalı (yazı tipini yerelde barındırmayı önerir). ÇIKTI: başlık başlık Durum (Var/Yok/Kısmen/Doğrulanamadı) + risk (yüksek/orta/düşük) tablosu, risk sırasına göre en önemli 5 madde ve eksik metinlerin kullanıma hazır taslakları (KVKK aydınlatma metni, çerez bildirimi, mesafeli satış/abonelik bilgilendirmesi, iletişim ve şikâyet bölümü, e-posta ret satırı). Ceza tutarlarını kesin ceza değil 2026 kanuni üst sınırı olarak anar; emin olmadığını “doğrulanamadı” diye yazar.',
          color: '#CA8A04',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 580 }
        },
        {
          id: 'claude-nova-dijital',
          index: 12,
          name: 'Claude',
          description: 'Claude — kıdemli danışman ve kalite denetçisi. Teslimden önce ekibin tüm çıktılarını gözden geçirir; hataları, eksikleri ve tutarsızlıkları düzeltir, metni netleştirir, kod veya otomasyon gerektiren kısımları adım adım planlar. Lider son teslimden önce Claude’a bir inceleme görevi verir.',
          color: '#D97757',
          model: DEFAULT_MODELS.text,
          position: { x: -420, y: 130 }
        },
        {
          id: 'obsidian-nova',
          index: 11,
          name: 'Obsidian',
          description: 'Ofisin beyni: kullanıcının Obsidian kasasındaki tüm projeleri, akıl haritalarını, kuralları ve tercihleri bilir. Her işin başında ekibe geçmiş projelerden ilgili bağlamı, kuralları ve kaçınılacak hataları özetler.',
          color: '#A855F7',
          model: DEFAULT_MODELS.text,
          position: { x: 420, y: 130 }
        },
        {
          id: 'nova-web-lead',
          index: 2,
          name: 'Web & Uygulama Şefi',
          description: 'Web sitesi ve uygulama projelerinin kapsamını, sayfalarını ve teslim takvimini belirler.',
          color: '#2563EB',
          model: DEFAULT_MODELS.text,
          position: { x: -500, y: 280 },
          subagents: [
            {
              id: 'nova-web-developer',
              index: 5,
              name: 'Web Geliştirici',
              description: 'Web sitesinin sayfa yapısını, bileşenlerini, teknolojisini ve SEO temelini planlar.',
              color: '#60A5FA',
              model: DEFAULT_MODELS.text,
              position: { x: -630, y: 430 }
            },
            {
              id: 'nova-app-developer',
              index: 6,
              name: 'Uygulama Geliştirici',
              description: 'Mobil/PWA uygulamanın ekranlarını, özelliklerini ve veri akışını tasarlar.',
              color: '#0EA5E9',
              model: DEFAULT_MODELS.text,
              position: { x: -370, y: 430 }
            }
          ]
        },
        {
          id: 'nova-ads-lead',
          index: 3,
          name: 'AI Reklam Şefi',
          description: 'AI video reklam projelerinde marka mesajını, hedef kitleyi ve platformu (Instagram, TikTok, YouTube) belirler.',
          color: '#DB2777',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 280 },
          subagents: [
            {
              id: 'nova-ad-copywriter',
              index: 7,
              name: 'Reklam Senaristi',
              description: 'Reklamın kancasını, sahne sahne senaryosunu ve CTA metnini yazar.',
              color: '#F472B6',
              model: DEFAULT_MODELS.text,
              position: { x: -130, y: 430 }
            },
            {
              id: 'nova-ai-video-producer',
              index: 8,
              name: 'AI Video Üreticisi',
              description: 'Senaryodan her sahne için AI görsel/video promptlarını, kamera hareketlerini ve stil kurallarını çıkarır.',
              color: '#E11D48',
              model: DEFAULT_MODELS.text,
              position: { x: 130, y: 430 }
            }
          ]
        },
        {
          id: 'nova-edit-lead',
          index: 4,
          name: 'Video Edit Şefi',
          description: 'İçerik üreticilerinin ham videoları için kurgu tarzını, süreyi ve teslim formatını belirler.',
          color: '#059669',
          model: DEFAULT_MODELS.text,
          position: { x: 500, y: 280 },
          subagents: [
            {
              id: 'nova-video-editor',
              index: 9,
              name: 'Video Editörü',
              description: 'Uzun video için kesim listesi, zoom/efekt noktaları, altyazı ve ses düzenini planlar.',
              color: '#34D399',
              model: DEFAULT_MODELS.text,
              position: { x: 370, y: 430 }
            },
            {
              id: 'nova-shorts-editor',
              index: 10,
              name: 'Shorts Kurgucusu',
              description: 'Uzun videodan en güçlü anları seçip dikey Shorts/Reels kesimlerini ve başlıklarını hazırlar.',
              color: '#10B981',
              model: DEFAULT_MODELS.text,
              position: { x: 630, y: 430 }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'youtube-otomasyonu',
    teamName: 'YouTube Otomasyonu',
    teamType: 'İçerik Hattı',
    teamDescription: 'Konu bulmadan paylaşıma sıralı YouTube hattı: her adımı farklı bir ajan yapar ve bir öncekinin çıktısını devralır.',
    color: '#FF0033',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'yt-channel-manager',
      index: 1,
      name: 'Kanal Yöneticisi',
      description: 'Hattı sırayla yürütür: Konu Bulucu, Metin Yazarı, Seslendirmen, Video Üretici, Video Editörü, Yayıncı. Bir adım onaylanmadan sonrakini başlatmaz. İlk görevi her zaman Obsidian’a verir: kanalın geçmiş videoları, kuralları ve kazanan formülünü toplatır.',
      color: '#FF0033',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'claude-youtube-otomasyonu',
          index: 9,
          name: 'Claude',
          description: 'Claude — kıdemli danışman ve kalite denetçisi. Teslimden önce ekibin tüm çıktılarını gözden geçirir; hataları, eksikleri ve tutarsızlıkları düzeltir, metni netleştirir, kod veya otomasyon gerektiren kısımları adım adım planlar. Lider son teslimden önce Claude’a bir inceleme görevi verir.',
          color: '#D97757',
          model: DEFAULT_MODELS.text,
          position: { x: -420, y: 130 }
        },
        {
          id: 'obsidian-yt',
          index: 8,
          name: 'Obsidian',
          description: 'Ofisin beyni: kullanıcının Obsidian kasasındaki tüm projeleri, akıl haritalarını, kuralları ve tercihleri bilir. Her işin başında ekibe geçmiş projelerden ilgili bağlamı, kuralları ve kaçınılacak hataları özetler.',
          color: '#A855F7',
          model: DEFAULT_MODELS.text,
          position: { x: 320, y: 260 }
        },
        {
          id: 'yt-topic-finder',
          index: 2,
          name: 'Konu Bulucu',
          description: 'Trend ve rakip kanallara bakarak tıklanacak video konusunu ve açısını bulur; 3 başlık önerisi verir.',
          color: '#F87171',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 0, y: 260 },
          subagents: [
            {
              id: 'yt-scriptwriter',
              index: 3,
              name: 'Metin Yazarı',
              description: 'Konu Bulucunun onaylı konusundan zaman damgalı (DD.SS) seslendirme metnini sahne sahne yazar.',
              color: '#3B82F6',
              model: DEFAULT_MODELS.text,
              humanInTheLoop: true,
              position: { x: 0, y: 390 },
              subagents: [
                {
                  id: 'yt-voice-artist',
                  index: 4,
                  name: 'Seslendirmen',
                  description: 'Onaylı metni seslendirmeye hazırlar: ses seçimi, hız, vurgu ve duraklama notları.',
                  color: '#A855F7',
                  model: DEFAULT_MODELS.text,
                  position: { x: 0, y: 520 },
                  subagents: [
                    {
                      id: 'yt-video-producer',
                      index: 5,
                      name: 'Video Üretici',
                      description: 'Metin ve sese göre her sahnenin görselini/B-roll kaynağını ve üretim promptlarını belirler.',
                      color: '#F59E0B',
                      model: DEFAULT_MODELS.text,
                      position: { x: 0, y: 650 },
                      subagents: [
                        {
                          id: 'yt-video-editor',
                          index: 6,
                          name: 'Video Editörü',
                          description: 'Sahneleri sese oturtur; geçiş, zoom, altyazı, müzik ve yazı kartı planını çıkarır.',
                          color: '#10B981',
                          model: DEFAULT_MODELS.text,
                          position: { x: 0, y: 780 },
                          subagents: [
                            {
                              id: 'yt-publisher',
                              index: 7,
                              name: 'Yayıncı',
                              description: 'Başlık, açıklama, etiketler, bölümler, kapak fikri ve yayın saatini hazırlayıp YouTube paylaşımını planlar.',
                              color: '#EC4899',
                              model: DEFAULT_MODELS.text,
                              position: { x: 0, y: 910 }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'musteri-kazanma',
    teamName: 'Müşteri Kazanma',
    teamType: 'Satış',
    teamDescription: 'Nova Dijital için hedef müşteri bulan, kişiye özel tanışma e-postası yazan, cevap gelince teklif ve takip mesajı hazırlayan satış ekibi.',
    color: '#0EA5E9',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'sales-manager',
      index: 1,
      name: 'Satış Müdürü',
      description: 'Hedef segmenti (YouTube kanalları, esnaf, şirketler) seçer, ekibi sırayla çalıştırır ve gönderilecek metinleri kullanıcı onayına sunar. İlk görevi her zaman Obsidian’a verir. Gönderilecek her e-postayı ve teklifi kullanıcıya sunmadan önce Hukuk Uyum Denetçisi’ne kontrol ettirir.',
      color: '#0EA5E9',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'hukuk-musteri-kazanma',
          index: 9,
          name: 'Hukuk Uyum Denetçisi',
          description: 'Türkiye hukuk uyum denetçisi (kontrol listesi uygular, hukuki görüş vermez). Gönderilecek her tanışma, takip ve teklif e-postasını 6563 sayılı Elektronik Ticaret Kanunu ve KVKK açısından kontrol eder ve eksikleri metne EKLER: alıcı tacir/esnaf/şirket mi yoksa gerçek kişi mi (gerçek kişiye önceden onay almadan ticari ileti risklidir, bunu işaretler); gönderenin kimliği ve iletişim adresi (Nova Dijital + e-posta); kolay ve ücretsiz ret yolu (ekip link kullanmıyorsa tanışma tonunu bozmayan tek satır: “Bu tür e-postalar almak istemezseniz yanıtlamanız yeterli, bir daha yazmayız.”); aday listesindeki kişisel verilerin yalnızca bu amaçla kullanılması ve gereksiz veri tutulmaması; teklifte fiyat, kapsam, ödeme ve cayma/iptal koşullarının açık yazılması. ÇIKTI: e-posta başına Var/Yok/Kısmen kontrolü, risk seviyesi ve düzeltilmiş metin. Ceza tutarlarını kesin ceza değil 2026 kanuni üst sınırı olarak anar (onaysız ileti 14.309 TL, kimlik/adres eksik 28.620 TL, ret yolu yok 42.930 TL).',
          color: '#CA8A04',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 580 }
        },
        {
          id: 'claude-musteri-kazanma',
          index: 8,
          name: 'Claude',
          description: 'Claude — kıdemli danışman ve kalite denetçisi. Teslimden önce ekibin tüm çıktılarını gözden geçirir; hataları, eksikleri ve tutarsızlıkları düzeltir, metni netleştirir, kod veya otomasyon gerektiren kısımları adım adım planlar. Lider son teslimden önce Claude’a bir inceleme görevi verir.',
          color: '#D97757',
          model: DEFAULT_MODELS.text,
          position: { x: -420, y: 130 }
        },
        {
          id: 'obsidian-sales',
          index: 2,
          name: 'Obsidian',
          description: 'Ofisin beyni: kullanıcının Obsidian kasasındaki tüm projeleri, akıl haritalarını, kuralları ve tercihleri bilir. Her işin başında ekibe geçmiş projelerden ilgili bağlamı, kuralları ve kaçınılacak hataları özetler.',
          color: '#A855F7',
          model: DEFAULT_MODELS.text,
          position: { x: 420, y: 130 }
        },
        {
          id: 'sales-lead-hunter',
          index: 3,
          name: 'Müşteri Avcısı',
          description: 'Hedef segmentte 10 aday çıkarır: isim, kanal/işletme, abone veya büyüklük, neden uygun olduğu. Finans, ekonomi ve bilgi anlatımı yapan konuşan-kafa kanallar önceliklidir.',
          color: '#38BDF8',
          model: DEFAULT_MODELS.text,
          position: { x: -450, y: 280 }
        },
        {
          id: 'sales-researcher',
          index: 4,
          name: 'Kanal Analisti',
          description: 'Seçilen adayın içeriğini inceler: en çok izlenen videolar, Shorts potansiyeli olan anlar, eksikler. E-postaya girecek 1-2 somut gözlem çıkarır.',
          color: '#22D3EE',
          model: DEFAULT_MODELS.text,
          position: { x: -150, y: 280 }
        },
        {
          id: 'sales-email-writer',
          index: 5,
          name: 'E-posta Yazarı',
          description: 'Soğuk ilk e-postayı yazar. KURALLAR: konu satırı "tanışma"; ilk mesaj SADECE tanışma, fiyat yok; madde işareti yok; link yok; kısa; kanala özel gözlem + ücretsiz örnek teklifi; imza "Nova Dijital Ekibi".',
          color: '#0284C7',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 150, y: 280 }
        },
        {
          id: 'sales-proposal',
          index: 6,
          name: 'Teklif Uzmanı',
          description: 'Karşı taraf ilgilenince fiyatlı teklif yazar. Editörlük: uzun videodan Short 300₺/adet (en az 5 hazırlanır, sadece seçilenler ücretli), sıfırdan Short 750₺, uzun video edit 1.000–1.200₺. Web: tek sayfa 3-7k₺, kurumsal 8-20k₺. Uygulama: 4-9k₺ başlangıç. AI video: 750-2000₺. %50 peşin, 2 revizyon ücretsiz.',
          color: '#0369A1',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 450, y: 280 }
        },
        {
          id: 'sales-followup',
          index: 7,
          name: 'Takip Uzmanı',
          description: 'Cevap gelmeyen adaylara 3-5 gün sonra gönderilecek kısa ve nazik hatırlatmayı yazar; baskı yapmaz, tek cümlelik değer ekler.',
          color: '#7DD3FC',
          model: DEFAULT_MODELS.text,
          position: { x: 450, y: 430 }
        }
      ]
    }
  },
  {
    id: 'shorts-fabrikasi',
    teamName: 'Shorts Fabrikası',
    teamType: 'Kısa Video',
    teamDescription: 'YouTube Shorts, Reels ve TikTok için 30-60 saniyelik dikey video paketleri: trend, kanca, senaryo, altyazı ve yayın planı.',
    color: '#F43F5E',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'shorts-manager',
      index: 1,
      name: 'Shorts Yöneticisi',
      description: 'Kanalı ve formatı (ör. Top 5 tarih, finans açıklaması, uzun videodan kesit) netleştirir, hattı sırayla yürütür. İlk görevi her zaman Obsidian’a verir.',
      color: '#F43F5E',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'claude-shorts-fabrikasi',
          index: 8,
          name: 'Claude',
          description: 'Claude — kıdemli danışman ve kalite denetçisi. Teslimden önce ekibin tüm çıktılarını gözden geçirir; hataları, eksikleri ve tutarsızlıkları düzeltir, metni netleştirir, kod veya otomasyon gerektiren kısımları adım adım planlar. Lider son teslimden önce Claude’a bir inceleme görevi verir.',
          color: '#D97757',
          model: DEFAULT_MODELS.text,
          position: { x: -420, y: 130 }
        },
        {
          id: 'obsidian-shorts',
          index: 2,
          name: 'Obsidian',
          description: 'Ofisin beyni: kullanıcının Obsidian kasasındaki tüm projeleri, akıl haritalarını, kuralları ve tercihleri bilir. Her işin başında ekibe geçmiş projelerden ilgili bağlamı, kuralları ve kaçınılacak hataları özetler.',
          color: '#A855F7',
          model: DEFAULT_MODELS.text,
          position: { x: 420, y: 130 }
        },
        {
          id: 'shorts-trend',
          index: 3,
          name: 'Trend Avcısı',
          description: 'Nişte şu an tutan 5 Shorts fikri bulur; her biri için neden tutacağını tek cümleyle açıklar.',
          color: '#FB7185',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 260 },
          subagents: [
            {
              id: 'shorts-hook',
              index: 4,
              name: 'Kanca Yazarı',
              description: 'Seçilen fikir için ilk 2 saniyede izleyiciyi durduracak 3 kanca cümlesi ve ekran yazısı yazar.',
              color: '#E11D48',
              model: DEFAULT_MODELS.text,
              humanInTheLoop: true,
              position: { x: 0, y: 390 },
              subagents: [
                {
                  id: 'shorts-script',
                  index: 5,
                  name: 'Kısa Senarist',
                  description: '30-60 saniyelik, saniye damgalı dikey video senaryosu yazar: sahne, seslendirme, ekran yazısı.',
                  color: '#BE123C',
                  model: DEFAULT_MODELS.text,
                  position: { x: 0, y: 520 },
                  subagents: [
                    {
                      id: 'shorts-editor',
                      index: 6,
                      name: 'Altyazı & Kurgu',
                      description: 'Kesim ritmi, zoom noktaları, animasyonlu altyazı vurguları, SFX ve müzik planını çıkarır; 9:16 ekran tamamen dolu olmalı.',
                      color: '#9F1239',
                      model: DEFAULT_MODELS.text,
                      position: { x: 0, y: 650 },
                      subagents: [
                        {
                          id: 'shorts-publisher',
                          index: 7,
                          name: 'Yayıncı',
                          description: 'Başlık, açıklama, hashtagler ve YouTube/Instagram/TikTok için ayrı yayın saatlerini hazırlar.',
                          color: '#FDA4AF',
                          model: DEFAULT_MODELS.text,
                          position: { x: 0, y: 780 }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'photo-studio',
    teamName: 'AI Reklam Görseli',
    teamType: 'Görsel',
    teamDescription: 'Ürün ve reklam görselleri (Nano Banana): sahne, ışık ve kompozisyonu ekip kurar, sen onaylayınca görsel üretilir. Gemini faturalandırması gerekir.',
    color: '#FBBF24',
    outputType: 'image',
    outputModel: DEFAULT_MODELS.image,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'art-director',
      index: 1,
      name: 'Art Director',
      description: 'Synthesizes descriptions into valid Nano Banana prompts.',
      color: '#FBBF24',
      humanInTheLoop: true,
      model: DEFAULT_MODELS.text,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'scene-designer',
          index: 2,
          name: 'Scene Designer',
          description: 'Focuses on Subject and Action within the scene.',
          color: '#F59E0B',
          humanInTheLoop: true,
          model: DEFAULT_MODELS.text,
          position: { x: -150, y: 280 }
        },
        {
          id: 'lighting-stylist',
          index: 3,
          name: 'Lighting Stylist',
          description: 'Focuses on Composition, Lighting, and Style/Materiality.',
          color: '#E0E672',
          humanInTheLoop: true,
          model: DEFAULT_MODELS.text,
          position: { x: 150, y: 280 }
        }
      ]
    }
  },
  {
    id: 'music-studio',
    teamName: 'Reklam Müziği',
    teamType: 'Müzik',
    teamDescription: 'Reklam ve videolar için telifsiz arka plan müziği (Lyria 3): tür, tempo, enstrüman ve dinamik planlanır. Gemini faturalandırması gerekir.',
    color: '#43E47C',
    outputType: 'music',
    outputModel: DEFAULT_MODELS.music,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'master-producer',
      index: 1,
      name: 'Master Producer',
      description: 'Orchestrates the 4 pillars of sound into a cohesive track.',
      color: '#43E47C',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'genre-expert',
          index: 2,
          name: 'Genre Expert',
          description: 'Defines style, mood, and global aesthetic (e.g., Synthwave, Lofi).',
          color: '#74D295',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: -450, y: 280 }
        },
        {
          id: 'tempo-architect',
          index: 3,
          name: 'Tempo Architect',
          description: 'Specifies BPM, rhythmical complexity, and time signatures.',
          color: '#92D540',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: -150, y: 280 }
        },
        {
          id: 'instrumentalist',
          index: 4,
          name: 'Instrumentalist',
          description: 'Selects timbres, arrangement, and orchestration layers.',
          color: '#40D5AD',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 150, y: 280 }
        },
        {
          id: 'dynamics-engineer',
          index: 5,
          name: 'Dynamics Engineer',
          description: 'Controls volume, texture, contrast, and emotional progression.',
          color: '#50BB55',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 450, y: 280 }
        }
      ]
    }
  },
  {
    id: 'film-studio',
    teamName: 'AI Reklam Videosu',
    teamType: 'Video',
    teamDescription: 'Dükkan ve markalar için kısa AI reklam videosu (Veo 3.1): görüntü + ses sahnesi ekip tarafından kurulur. Gemini faturalandırması gerekir.',
    color: '#E64347',
    outputType: 'video',
    outputModel: DEFAULT_MODELS.video,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'film-director',
      index: 1,
      name: 'Film Director',
      description: 'Orchestrates visuals and soundstage with global cinematic vision.',
      color: '#E64347',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'visual-lead',
          index: 2,
          name: 'Visual Lead',
          description: 'Manages cinematography and VFX direction.',
          color: '#F17DC5',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: -200, y: 280 },
          subagents: [
            {
              id: 'cinematographer',
              index: 4,
              name: 'Cinematographer',
              description: 'Defines camera work, shot composition, and subject action.',
              color: '#E643C5',
              model: DEFAULT_MODELS.text,
              position: { x: -200, y: 430 }
            }
          ]
        },
        {
          id: 'audio-lead',
          index: 3,
          name: 'Audio Lead',
          description: 'Manages the soundstage: Dialogue, SFX, and Ambience.',
          color: '#7CE630',
          model: DEFAULT_MODELS.text,
          humanInTheLoop: true,
          position: { x: 200, y: 280 },
          subagents: [
            {
              id: 'sound-designer',
              index: 5,
              name: 'Sound Designer',
              description: 'Specifies SFX (SFX:), Ambient Noise (Ambient noise:), and Dialogue (" ").',
              color: '#50BB55',
              model: DEFAULT_MODELS.text,
              position: { x: 200, y: 430 }
            }
          ]
        }
      ]
    }
  }
];

export function getAgentSet(id: string, customSystems: AgenticSystem[] = []): AgenticSystem {
  return (
    customSystems.find((s) => s.id === id) ||
    AGENTIC_SETS.find((s) => s.id === id) ||
    AGENTIC_SETS[0]
  );
}

export function getAllAgents(system: AgenticSystem): AgentNode[] {
  const agents: AgentNode[] = [];
  const traverse = (node: AgentNode) => {
    agents.push(node);
    if (node.subagents) {
      node.subagents.forEach(traverse);
    }
  };
  traverse(system.leadAgent);
  return agents;
}

export function getAllCharacters(system: AgenticSystem): AgentNode[] {
  const userNode: AgentNode = {
    id: USER_ID,
    index: system.user.index,
    name: USER_NAME,
    color: USER_COLOR,
    model: system.user.model,
    description: 'Human user issuing commands.',
  };
  return [userNode, ...getAllAgents(system)];
}
