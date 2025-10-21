export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { 
          id: string; 
          user_id: string; 
          username: string; 
          avatar_url: string | null; 
          created_at: string;
        }
        Insert: { 
          user_id: string; 
          username: string; 
          avatar_url?: string | null;
        }
        Update: { 
          username?: string; 
          avatar_url?: string | null;
        }
      }
      social_accounts: {
        Row: { 
          id: string; 
          user_id: string; 
          platform: string; 
          handle: string; 
          created_at: string;
        }
        Insert: { 
          user_id: string; 
          platform: string; 
          handle: string;
        }
        Update: { 
          handle?: string;
        }
      }
    }
  }
}
