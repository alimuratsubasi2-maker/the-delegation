import { USER_COLOR } from '../theme/brand';
import { DEFAULT_MODELS } from '../core/llm/constants';

export const USER_ID = 'user';
export const USER_NAME = 'User';
export const MAX_AGENTS = 10;
export { USER_COLOR };
export const DEFAULT_AGENTIC_SET_ID = 'single-agent';
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
    teamType: 'Digital Agency',
    teamDescription: 'A 10-person digital agency: strategy, creative and growth departments delivering websites, brands and campaigns.',
    color: '#7C3AED',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: true,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'nova-ceo',
      index: 1,
      name: 'CEO',
      description: 'Breaks the client brief into strategy, creative and growth workstreams and approves the final delivery.',
      color: '#7C3AED',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'nova-strategy-lead',
          index: 2,
          name: 'Strategy Lead',
          description: 'Turns the brief into positioning, target audience and a measurable plan.',
          color: '#2563EB',
          model: DEFAULT_MODELS.text,
          position: { x: -500, y: 280 },
          subagents: [
            {
              id: 'nova-market-researcher',
              index: 5,
              name: 'Market Researcher',
              description: 'Researches competitors, pricing and audience pain points.',
              color: '#60A5FA',
              model: DEFAULT_MODELS.text,
              position: { x: -630, y: 430 }
            },
            {
              id: 'nova-seo-specialist',
              index: 6,
              name: 'SEO Specialist',
              description: 'Plans keywords, site structure and search-friendly content.',
              color: '#0EA5E9',
              model: DEFAULT_MODELS.text,
              position: { x: -370, y: 430 }
            }
          ]
        },
        {
          id: 'nova-creative-lead',
          index: 3,
          name: 'Creative Lead',
          description: 'Owns the visual and verbal identity of every deliverable.',
          color: '#DB2777',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 280 },
          subagents: [
            {
              id: 'nova-copywriter',
              index: 7,
              name: 'Copywriter',
              description: 'Writes headlines, page copy and ad texts in the brand voice.',
              color: '#F472B6',
              model: DEFAULT_MODELS.text,
              position: { x: -130, y: 430 }
            },
            {
              id: 'nova-brand-designer',
              index: 8,
              name: 'Brand Designer',
              description: 'Defines logo direction, color palette, typography and layouts.',
              color: '#E11D48',
              model: DEFAULT_MODELS.text,
              position: { x: 130, y: 430 }
            }
          ]
        },
        {
          id: 'nova-growth-lead',
          index: 4,
          name: 'Growth Lead',
          description: 'Plans launch, channels and conversion tracking.',
          color: '#059669',
          model: DEFAULT_MODELS.text,
          position: { x: 500, y: 280 },
          subagents: [
            {
              id: 'nova-social-media',
              index: 9,
              name: 'Social Media Manager',
              description: 'Creates the content calendar and post ideas for Instagram and TikTok.',
              color: '#34D399',
              model: DEFAULT_MODELS.text,
              position: { x: 370, y: 430 }
            },
            {
              id: 'nova-web-developer',
              index: 10,
              name: 'Web Developer',
              description: 'Specifies the site architecture, pages, components and tech stack.',
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
    id: 'etsy-shop-studio',
    teamName: 'Etsy Shop Studio',
    teamType: 'E-commerce',
    teamDescription: 'A 10-agent team that finds a profitable niche and ships ready-to-publish digital product listings.',
    color: '#F1641E',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'etsy-shop-manager',
      index: 1,
      name: 'Shop Manager',
      description: 'Coordinates research, product and listing teams and signs off each listing.',
      color: '#F1641E',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'etsy-research-lead',
          index: 2,
          name: 'Research Lead',
          description: 'Decides which niche and product to build next based on demand and competition.',
          color: '#EA580C',
          model: DEFAULT_MODELS.text,
          position: { x: -500, y: 280 },
          subagents: [
            {
              id: 'etsy-niche-hunter',
              index: 5,
              name: 'Niche Hunter',
              description: 'Finds rising, low-competition digital product niches and seasonal trends.',
              color: '#FB923C',
              model: DEFAULT_MODELS.text,
              position: { x: -630, y: 430 }
            },
            {
              id: 'etsy-competitor-analyst',
              index: 6,
              name: 'Competitor Analyst',
              description: 'Studies best-selling competitor listings, prices and review complaints.',
              color: '#F59E0B',
              model: DEFAULT_MODELS.text,
              position: { x: -370, y: 430 }
            }
          ]
        },
        {
          id: 'etsy-product-lead',
          index: 3,
          name: 'Product Lead',
          description: 'Defines what the digital product contains and how it is formatted.',
          color: '#8B5CF6',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 280 },
          subagents: [
            {
              id: 'etsy-product-designer',
              index: 7,
              name: 'Product Designer',
              description: 'Outlines pages, sections and visual style of the printable or spreadsheet.',
              color: '#A78BFA',
              model: DEFAULT_MODELS.text,
              position: { x: -130, y: 430 }
            },
            {
              id: 'etsy-quality-checker',
              index: 8,
              name: 'Quality Checker',
              description: 'Reviews the product plan for clarity, value and Etsy policy compliance.',
              color: '#6366F1',
              model: DEFAULT_MODELS.text,
              position: { x: 130, y: 430 }
            }
          ]
        },
        {
          id: 'etsy-listing-lead',
          index: 4,
          name: 'Listing Lead',
          description: 'Assembles the final listing package.',
          color: '#16A34A',
          model: DEFAULT_MODELS.text,
          position: { x: 500, y: 280 },
          subagents: [
            {
              id: 'etsy-seo-copywriter',
              index: 9,
              name: 'SEO Copywriter',
              description: 'Writes the title, 13 tags and the description optimized for Etsy search.',
              color: '#4ADE80',
              model: DEFAULT_MODELS.text,
              position: { x: 370, y: 430 }
            },
            {
              id: 'etsy-pricing-strategist',
              index: 10,
              name: 'Pricing Strategist',
              description: 'Sets launch price, bundles and discount strategy.',
              color: '#22C55E',
              model: DEFAULT_MODELS.text,
              position: { x: 630, y: 430 }
            }
          ]
        }
      ]
    }
  },
  {
    id: 'youtube-studio',
    teamName: 'YouTube Studio',
    teamType: 'Content Channel',
    teamDescription: 'A 10-agent YouTube team producing documentary-style tech video packages: research, script, title and thumbnail.',
    color: '#FF0033',
    outputType: 'text',
    outputModel: DEFAULT_MODELS.text,
    outputAutoApprove: false,
    user: { index: 0, model: 'Human', position: { x: 0, y: 0 } },
    leadAgent: {
      id: 'yt-showrunner',
      index: 1,
      name: 'Showrunner',
      description: 'Picks the angle, keeps the story on track and approves the final video package.',
      color: '#FF0033',
      model: DEFAULT_MODELS.text,
      humanInTheLoop: true,
      position: { x: 0, y: 130 },
      subagents: [
        {
          id: 'yt-research-lead',
          index: 2,
          name: 'Research Lead',
          description: 'Gathers the facts, timeline and sources behind the story.',
          color: '#DC2626',
          model: DEFAULT_MODELS.text,
          position: { x: -500, y: 280 },
          subagents: [
            {
              id: 'yt-trend-scout',
              index: 5,
              name: 'Trend Scout',
              description: 'Spots trending tech topics and proven video formats in the niche.',
              color: '#F87171',
              model: DEFAULT_MODELS.text,
              position: { x: -630, y: 430 }
            },
            {
              id: 'yt-fact-checker',
              index: 6,
              name: 'Fact Checker',
              description: 'Verifies every claim, date and number in the script.',
              color: '#B91C1C',
              model: DEFAULT_MODELS.text,
              position: { x: -370, y: 430 }
            }
          ]
        },
        {
          id: 'yt-story-lead',
          index: 3,
          name: 'Story Lead',
          description: 'Shapes the narrative arc and pacing for an 8-10 minute video.',
          color: '#2563EB',
          model: DEFAULT_MODELS.text,
          position: { x: 0, y: 280 },
          subagents: [
            {
              id: 'yt-scriptwriter',
              index: 7,
              name: 'Scriptwriter',
              description: 'Writes the timestamped voiceover script scene by scene.',
              color: '#3B82F6',
              model: DEFAULT_MODELS.text,
              position: { x: -130, y: 430 }
            },
            {
              id: 'yt-hook-writer',
              index: 8,
              name: 'Hook Writer',
              description: 'Crafts the first 30 seconds and retention beats.',
              color: '#1D4ED8',
              model: DEFAULT_MODELS.text,
              position: { x: 130, y: 430 }
            }
          ]
        },
        {
          id: 'yt-packaging-lead',
          index: 4,
          name: 'Packaging Lead',
          description: 'Owns everything that earns the click.',
          color: '#CA8A04',
          model: DEFAULT_MODELS.text,
          position: { x: 500, y: 280 },
          subagents: [
            {
              id: 'yt-thumbnail-designer',
              index: 9,
              name: 'Thumbnail Designer',
              description: 'Describes thumbnail concepts: subject, text and contrast.',
              color: '#FACC15',
              model: DEFAULT_MODELS.text,
              position: { x: 370, y: 430 }
            },
            {
              id: 'yt-title-seo',
              index: 10,
              name: 'Title & SEO Specialist',
              description: 'Writes title options, description, chapters and tags.',
              color: '#EAB308',
              model: DEFAULT_MODELS.text,
              position: { x: 630, y: 430 }
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
