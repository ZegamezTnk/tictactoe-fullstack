export interface SupabaseUser {
  id: string;
  email?: string;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    picture?: string;
    [key: string]: any;
  };
  aud: string;
  created_at: string;
}

export interface HonoVariables {
  user: SupabaseUser;
}