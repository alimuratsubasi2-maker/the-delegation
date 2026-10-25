import { USER_COLOR } from '../theme/brand';
import { DEFAULT_MODELS } from '../core/llm/constants';

export const USER_ID = 'user';
export const USER_NAME = 'User';
export const MAX_AGENTS = 11;
export { USER_COLOR };
export const DEFAULT_AGENTIC_SET_ID = 'single-agent';
/** Bump whenever built-in teams change so stale saved copies are discarded. */
export const BUILT_IN_TEAMS_VERSION = 4;
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
      description: 'Müşteri talebini web/uygulama, AI reklam ve video edit ekiplerine böler, TL fiyat ve teslim planını çıkarır, son teslimi onaylar. İlk görevi her zaman Obsidian’a verir: kullanıcının geçmiş projelerinden ilgili bağlamı toplatır.',
      color: '#7C3AED',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
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
    id: 'unboring-net',
    teamName: 'unboring.net',
    teamType: 'Agency',
    teamDescription: 'A full-service creative agency covering branding, design, development and go-to-market strategy.',
    color: '#4285F4',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: true,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'agency-orchestrator',
      index: 1,
      name: 'Creative Director',
      description: 'Orchestrates branding, design, and development to deliver integrated creative solutions.',
      color: '#4285F4',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'agency-developer',
          index: 2,
          name: 'Developer',
          description: 'Architects and develops robust digital platforms and interactive experiences.',
          color: '#34A853',
          model: DEFAULT_MODELS.text,
          position: { x: -300, y: 280 }
        },
        {
          id: 'agency-designer',
          index: 3,
          name: 'Designer',
          description: 'Crafts visual identities, user interfaces, and premium brand aesthetics.',
          color: '#FBBC05',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 280 }
        },
        {
          id: 'agency-copywriter',
          index: 4,
          name: 'Copywriter',
          description: 'Crafts compelling narratives and strategic messaging for brands.',
          color: '#EA4335',
          humanInTheLoop: true,
          model: DEFAULT_MODELS.text,
          position: { x: 300, y: 280 }
        }
      ]
    }
  },
  {
    id: 'photo-studio',
    teamName: 'Nano Banana Lab',
    teamType: 'Visual',
    teamDescription: 'Pro image generation using the [Subject] + [Action] + [Context] + [Comp] + [Style] formula.',
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
    teamName: 'Lyria Factory',
    teamType: 'Music Production',
    teamDescription: 'High-fidelity audio production following Lyria guidelines.',
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
    teamName: 'Veo Studio',
    teamType: 'Cinematic',
    teamDescription: 'Full cinematic production: Visuals + Soundstage (Veo 3.1 style).',
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
  },
  {
    id: 'strategy-coach',
    teamName: 'Strategy Coach',
    teamType: 'Strategic',
    teamDescription: 'A high-level strategic advisor for project direction and roadmap.',
    color: '#64748B',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: true,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'visionary-advisor',
      index: 1,
      name: 'Visionary Advisor',
      description: 'Handles project direction, roadmap, and ecosystem growth strategy.',
      color: '#64748B',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 }
    }
  },
  {
    id: 'pr-agency',
    teamName: 'PR Agency',
    teamType: 'Public Relations',
    teamDescription: 'A sequential pipeline for media outreach: from strategy to press drafting.',
    color: '#E34B99',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'pr-director',
      index: 1,
      name: 'PR Director',
      description: 'Oversees media relations, strategic communications, and brand reputation.',
      color: '#E34B99',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'media-strategist',
          index: 2,
          name: 'Media Strategist',
          description: 'Identifies key media outlets and manages journalist outreach.',
          color: '#E6D979',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 260 },
          subagents: [
            {
              id: 'press-writer',
              index: 3,
              name: 'Press Writer',
              description: 'Drafts press releases and media kits based on strategic goals.',
              color: '#5E888E',
              model: DEFAULT_MODELS.text,
              position: { x: 0, y: 390 }
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
