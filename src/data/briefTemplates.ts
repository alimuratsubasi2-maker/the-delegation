/**
 * Ready-made project briefs shown as one-click chips when chatting with a
 * team's lead agent before a project starts. Keyed by team id.
 */
export interface BriefTemplate {
  label: string;
  text: string;
}

export const BRIEF_TEMPLATES: Record<string, BriefTemplate[]> = {
  'nova-dijital': [
    { label: 'Web sitesi teklifi', text: 'Bir müşteri için web sitesi projesi: [işletme adı ve sektörü]. İhtiyaç: [tek sayfa / kurumsal / e-ticaret]. Sayfa yapısını, özellikleri, teslim takvimini ve TL fiyat teklifini hazırlayın.' },
    { label: 'Uygulama planı', text: 'Bir müşteri için mobil uygulama (PWA) projesi: [ne işe yarayacak]. Ekranları, özellikleri, veri akışını, teslim takvimini ve TL fiyat teklifini çıkarın.' },
    { label: 'AI reklam videosu', text: '[İşletme / ürün] için 15-30 saniyelik AI reklam videosu. Platform: [Instagram/TikTok/YouTube]. Kanca, sahne sahne senaryo, her sahnenin AI video promptu ve CTA metnini hazırlayın.' },
    { label: 'Video edit paketi', text: '[Kanal adı] için ham çekimden uzun video kurgusu ve bu videodan en az 5 Shorts. Kurgu tarzını, kesim listesini, altyazı ve Shorts anlarını planlayın.' },
  ],
  'youtube-otomasyonu': [
    { label: 'Tekno Arşiv videosu', text: 'Tekno Arşiv kanalı için 8-10 dakikalık belgesel tarzı video. Konu: bir zamanlar çok ünlü olup çöken bir teknoloji markası. Başlık formatı "Peki X Neden ÇÖKTÜ?". Zaman damgalı (DD.SS) Türkçe metin. Konu Bulucudan Yayıncıya kadar sırayla gidin.' },
    { label: 'Narvex AI deneyi', text: 'Narvex kanalı için yeni bir AI modelini/özelliğini gerçekten deneyip anlatan video. "Denedim" dili, ekran kaydı sahneleri, Başkaları bölümü. Konu: [model adı].' },
    { label: 'Haftanın konuları', text: 'Bu hafta kanal için çekilebilecek en güçlü 5 video konusunu bulun, her biri için başlık, kapak fikri ve neden tutacağını yazın; en iyisinin metnini hazırlayın.' },
  ],
  'musteri-kazanma': [
    { label: 'YouTube kanallarına ulaş', text: 'Finans, ekonomi ve bilgi anlatımı yapan 400K-900K aboneli tek kişilik Türk YouTube kanallarına Shorts ve uzun video editörlüğü için ulaşacağız. 10 aday bulun, en iyi 3 tanesi için kanala özel tanışma e-postası yazın.' },
    { label: 'Esnafa web sitesi', text: '[Şehir] bölgesindeki [sektör] işletmelerine web sitesi ve AI reklam videosu satacağız. 10 aday bulun ve her biri için 2 cümlelik, linksiz, çok kısa tanışma mesajı yazın.' },
    { label: 'Cevap geldi: teklif', text: '[Kanal/işletme adı] ilgilendiğini ve fiyat sorduğunu yazdı. Mesajı: "[gelen cevap]". Ona güncel fiyat listemizle kısa ve sıcak bir teklif e-postası yazın.' },
  ],
  'shorts-fabrikasi': [
    { label: 'Historium Top 5', text: 'Historium kanalı için İngilizce "Top 5" tarih Shorts\'u. Konu: [konu]. 45-55 saniye, güçlü kanca, saniye damgalı senaryo ve yayın planı.' },
    { label: 'Finans TikTok', text: 'Para Mantığı TikTok hesabı için dikey finans videosu. Konu: [konu]. 30-45 saniye, basit anlatım, ekran yazıları ve altyazı vurguları.' },
    { label: 'Uzun videodan kesit', text: '[Video linki / konusu] uzun videosundan çıkarılacak en iyi 5 Shorts anını seçin; her biri için kanca, başlık ve kesim planı hazırlayın.' },
  ],
};
