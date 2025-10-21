export interface Database {
  public: {
    Tables: {
      bounties: {
        Row: {
          id: number;
          name: string;
          total_bounty: number;
          rate_per_1k_views: number;
          description: string;
          claimed_bounty: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          total_bounty: number;
          rate_per_1k_views: number;
          description: string;
          claimed_bounty?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          total_bounty?: number;
          rate_per_1k_views?: number;
          description?: string;
          claimed_bounty?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      submissions: {
        Row: {
          id: number;
          bounty_id: number;
          user_id: string;
          video_url: string;
          view_count: number;
          earned_amount: number;
          status: 'pending' | 'approved' | 'rejected';
          validation_explanation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          bounty_id: number;
          user_id: string;
          video_url: string;
          view_count?: number;
          earned_amount?: number;
          status?: 'pending' | 'approved' | 'rejected';
          validation_explanation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          bounty_id?: number;
          user_id?: string;
          video_url?: string;
          view_count?: number;
          earned_amount?: number;
          status?: 'pending' | 'approved' | 'rejected';
          validation_explanation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          user_id: string;
          email: string | null;
          username: string | null;
          total_earnings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email?: string | null;
          username?: string | null;
          total_earnings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string | null;
          username?: string | null;
          total_earnings?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bounty_items: {
        Row: {
          id: number;
          bounty_id: number;
          user_id: string;
          url: string;
          title: string;
          cover_image_url: string | null;
          author: string | null;
          view_count: number;
          like_count: number;
          platform: 'youtube' | 'tiktok' | 'instagram' | 'other' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          bounty_id: number;
          user_id: string;
          url: string;
          title: string;
          cover_image_url?: string | null;
          author?: string | null;
          view_count?: number;
          like_count?: number;
          platform?: 'youtube' | 'tiktok' | 'instagram' | 'other' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          bounty_id?: number;
          user_id?: string;
          url?: string;
          title?: string;
          cover_image_url?: string | null;
          author?: string | null;
          view_count?: number;
          like_count?: number;
          platform?: 'youtube' | 'tiktok' | 'instagram' | 'other' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

