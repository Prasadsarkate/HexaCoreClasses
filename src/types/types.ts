// Database types matching Supabase schema

export type UserRole = 'user' | 'admin';
export type SubjectType = 'NEET' | 'JEE' | 'Python' | 'Java' | 'JavaScript' | 'Data Science';

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  image_url?: string | null; // Optional: Added for course thumbnails
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string;
  video_count: number;
  pdf_count: number;
  total_duration: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  playlist_id: string;
  completed: boolean;
  watch_time: number;
  last_watched_at: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  username: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  full_name: string | null;
  date_of_birth: string | null;
  bio: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string;
  video_url: string;
  duration: number; // in seconds
  subject: SubjectType;
  subject_id: string | null;
  playlist_id: string | null;
  order_index: number;
  is_featured: boolean;
  created_at: string;
}

export interface PollOption {
  id: string;
  doubt_id: string;
  option_text: string;
  votes_count: number;
  created_at: string;
}

export interface PDF {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string;
  pdf_url: string;
  download_url: string;
  subject: SubjectType;
  subject_id: string | null;
  playlist_id: string | null;
  order_index: number;
  page_count: number | null;
  created_at: string;
}

export interface Doubt {
  id: string;
  student_id: string;
  question: string;
  image_url: string | null;
  channel: string;
  type: 'post' | 'poll' | 'code';
  code_snippet: string | null;
  status: 'pending' | 'answered';
  answered_at: string | null;
  answered_by: string | null;
  upvotes_count: number;
  upvoted?: boolean;
  poll_options?: PollOption[];
  user_vote?: string | null;
  created_at: string;
}

export interface Answer {
  id: string;
  doubt_id: string;
  expert_name: string;
  answer_text: string;
  is_expert: boolean;
  admin_id: string | null;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  completed_videos: number;
  total_watch_time: number; // in seconds
  progress_percentage: number;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  video_id: string | null;
  pdf_id: string | null;
  created_at: string;
}

export interface Download {
  id: string;
  user_id: string;
  pdf_id: string;
  downloaded_at: string;
}

// Extended types with relations
export interface DoubtWithAnswers extends Doubt {
  answers: Answer[];
  student: {
    username: string;
    avatar_url: string | null;
  };
}

export interface DownloadWithPDF extends Download {
  pdf: PDF;
}

export interface AdminStatistics {
  total_users: number;
  total_videos: number;
  total_pdfs: number;
  total_doubts: number;
  unanswered_doubts: number;
}

export interface Credit {
  id: string;
  name: string;
  type: 'youtube' | 'college' | 'website';
  logo_url: string;
  description: string;
  course_count: number;
  link_url: string;
  badge_text?: string;
  color_theme?: string;
  created_at?: string;
}
export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  read_time: string;
  thumbnail_url: string;
  tags?: string;
  content?: string;
  status: 'draft' | 'published';
  author_name?: string;
  author_avatar_url?: string;
  created_at: string;
}
