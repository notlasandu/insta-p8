export type ContentStatus = 
  | 'IDEA'
  | 'IN_PROGRESS'
  | 'READY'
  | 'POSTED'
  | 'NEEDS_REVISION'
  | 'SCRAPPED';

export interface ContentItem {
  id: string;
  title: string;
  status: ContentStatus;
  scheduledDate?: string; // ISO date string
  description?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  thumbnail?: string;
}
