export enum GameState {
  PLAYING,
  MODAL_OPEN,
  LOADING
}

export interface Zone {
  id: string;
  title: string;
  x: number;
  width: number;
  type: 'welcome' | 'about' | 'skills' | 'projects' | 'contact';
  triggerText: string;
  color: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  image: string;
  demoUrl?: string;
  repoUrl?: string;
}

export interface SkillCategory {
  category: string;
  items: { name: string; level: number }[];
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  direction: 1 | -1; // 1 right, -1 left
  isMoving: boolean;
  isJumping: boolean;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean; // Renamed from 'up' to match action name
  interact: boolean;
}