export interface Anime {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  genres: string[];
  rating?: string;
  year?: string;
}

export interface Stream {
  title: string;
  url: string;
  quality: string;
}

export interface AddonConfig {
  includeDubbed: boolean;
  includeSubbed: boolean;
  proxyUrl: string;
}

export enum ViewState {
  HOME = 'HOME',
  CATALOG = 'CATALOG',
  CODE = 'CODE',
  DETAILS = 'DETAILS',
  ROADMAP = 'ROADMAP',
  INSTALL = 'INSTALL'
}