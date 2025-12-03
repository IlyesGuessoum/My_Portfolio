import { Zone, Project, SkillCategory } from './types';

// World Physics & Dimensions
export const WORLD_WIDTH = 10000;
export const GRAVITY = 0.8;
export const JUMP_FORCE = -15;
export const MOVEMENT_SPEED = 8;
export const FRICTION = 0.85;
export const ACCELERATION = 1.5;

// Zones Definition
export const ZONES: Zone[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    x: 400,
    width: 400,
    type: 'welcome',
    triggerText: '',
    color: '#60A5FA'
  },
  {
    id: 'about',
    title: 'About Me',
    x: 2000,
    width: 400,
    type: 'about',
    triggerText: 'ACCESS BIO-DATA [E]',
    color: '#34D399'
  },
  {
    id: 'skills',
    title: 'Skill Tree',
    x: 4000,
    width: 400,
    type: 'skills',
    triggerText: 'Press E to Inspect Skills',
    color: '#F472B6'
  },
  {
    id: 'projects',
    title: 'Project Gallery',
    x: 6500,
    width: 600,
    type: 'projects',
    triggerText: 'Press E to View Projects',
    color: '#FBBF24'
  },
  {
    id: 'contact',
    title: 'Contact Hub',
    x: 9000,
    width: 400,
    type: 'contact',
    triggerText: 'Press E to Contact',
    color: '#A78BFA'
  }
];

// Content Data
export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Dashboard',
    description: 'A comprehensive analytics dashboard for online retailers featuring real-time data visualization.',
    tech: ['React', 'TypeScript', 'D3.js', 'Tailwind'],
    image: 'https://picsum.photos/seed/proj1/600/400'
  },
  {
    id: '2',
    title: 'AI Chat Application',
    description: 'Real-time chat interface integrating Gemini API for smart responses.',
    tech: ['Next.js', 'Gemini API', 'WebSockets'],
    image: 'https://picsum.photos/seed/proj2/600/400'
  },
  {
    id: '3',
    title: 'Task Management System',
    description: 'Kanban-style project management tool with drag-and-drop capabilities.',
    tech: ['Vue.js', 'Firebase', 'Pinia'],
    image: 'https://picsum.photos/seed/proj3/600/400'
  }
];

export const SKILLS: SkillCategory[] = [
  {
    category: 'Frontend',
    items: [
      { name: 'React/Next.js', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Tailwind CSS', level: 95 },
      { name: 'Three.js/Canvas', level: 75 }
    ]
  },
  {
    category: 'Backend',
    items: [
      { name: 'Node.js', level: 85 },
      { name: 'PostgreSQL', level: 80 },
      { name: 'GraphQL', level: 70 }
    ]
  },
  {
    category: 'Tools',
    items: [
      { name: 'Git/GitHub', level: 90 },
      { name: 'Docker', level: 65 },
      { name: 'Figma', level: 80 }
    ]
  }
];

export const ABOUT_TEXT = `I am a passionate Full Stack Developer with a love for creative coding and interactive web experiences. 
I specialize in building performant, scalable, and visually stunning applications using modern web technologies. 
When I'm not coding, you can find me exploring game design or contributing to open source projects.`;