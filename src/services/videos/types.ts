
import { MaterialTheme } from '../materials/types';

export interface Video {
  id: string;
  title: string;
  description: string;
  source: VideoSource;
  url: string;
  thumbnail: string;
  category: string;
  duration?: string;
  date_added: string;
  views: number;
  created_by?: string;
  navigation_id?: string | null;
  format_id?: string | null;
  themes?: MaterialTheme[];
  likes?: number;
}

export type VideoSource = 'youtube' | 'vimeo' | 'storage';

export interface VideoComment {
  id: string;
  video_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  likes_count: number;
}
