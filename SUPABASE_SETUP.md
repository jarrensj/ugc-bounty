# Supabase Integration Setup Guide

This guide will help you set up Supabase with Clerk authentication for the UGC bounty platform.

## Prerequisites

- Clerk account and application set up
- Supabase account and project created

## 1. Supabase Project Setup

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Note down your project URL and anon key from Settings > API
3. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor

## 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Clerk Authentication (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk URLs (optional)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 3. Clerk JWT Template Configuration

1. In your Clerk dashboard, go to **JWT Templates**
2. Create a new template named `supabase`
3. Configure the template with the following settings:

```json
{
  "aud": "authenticated",
  "exp": "{{session.expire_at}}",
  "iat": "{{session.issued_at}}",
  "iss": "https://your-clerk-domain.clerk.accounts.dev",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "app_metadata": {
    "provider": "clerk",
    "providers": ["clerk"]
  },
  "user_metadata": {
    "first_name": "{{user.first_name}}",
    "last_name": "{{user.last_name}}",
    "image_url": "{{user.image_url}}"
  },
  "role": "authenticated"
}
```

## 4. Supabase Authentication Configuration

1. In your Supabase dashboard, go to **Authentication > Providers**
2. Enable **Custom JWT** provider
3. **Important**: Do NOT set the JWT secret directly in the database. Instead:
   - Get your Clerk JWT secret from your Clerk dashboard
   - In Supabase, go to **Settings > API** and configure the JWT secret there
   - Or use Supabase Vault to store the secret securely:
     ```sql
     select vault.create_secret('JWT_SECRET', 'your_clerk_jwt_secret', 'The JWT secret from Clerk');
     ```
4. Configure the JWT URL to point to your Clerk instance

## 5. Database Schema

The database includes two main tables:

### Profiles Table
- `id`: UUID primary key
- `user_id`: Clerk user ID (text)
- `username`: User's display name
- `avatar_url`: Optional profile picture URL
- `created_at`: Timestamp

### Social Accounts Table
- `id`: UUID primary key
- `user_id`: Clerk user ID (text)
- `platform`: Social media platform (tiktok, instagram, twitter, youtube)
- `handle`: Social media handle/username
- `created_at`: Timestamp

## 6. Row Level Security (RLS)

All tables have RLS enabled with policies that ensure users can only access their own data. The policies use Clerk JWT claims to match the `user_id` field.

## 7. API Endpoints

The following API endpoints are available:

### Profiles
- `GET /api/profiles` - Get current user's profile
- `POST /api/profiles` - Create or update user profile

### Social Accounts
- `GET /api/social-accounts` - Get current user's social accounts
- `POST /api/social-accounts` - Add a new social account

## 8. Usage Examples

### Client-side usage with React hooks:

```typescript
import { useSupabaseClient } from '@/lib/supabase/client';

function ProfileComponent() {
  const supabase = useSupabaseClient();
  
  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    
    if (error) console.error(error);
    else console.log(data);
  };
  
  return <div>Profile component</div>;
}
```

### Server-side usage in API routes:

```typescript
import { createClerkSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase.from('profiles').select('*');
  // Handle response
}
```

## 9. Testing the Integration

1. Start your development server: `npm run dev`
2. Sign in with Clerk
3. Test API endpoints using the browser dev tools or a tool like Postman
4. Verify that RLS policies are working by checking Supabase logs

## Troubleshooting

### Common Issues

**Error: `permission denied to set parameter "app.jwt_secret"`**
- This error occurs because Supabase no longer allows setting JWT secrets directly in SQL
- Solution: Configure the JWT secret through Supabase dashboard Settings > API, or use Vault
- Do NOT run `ALTER DATABASE postgres SET "app.jwt_secret"` commands

**Authentication not working**
- Ensure JWT template is correctly configured in Clerk
- Verify environment variables are set correctly
- Check Supabase logs for authentication errors
- Ensure RLS policies are properly set up
- Verify that Clerk JWT secret matches Supabase configuration

**RLS policies not working**
- Make sure RLS is enabled on your tables
- Verify that the JWT contains the correct `sub` claim
- Check that your policies use `(auth.jwt() ->> 'sub') = user_id` pattern
- Test policies in Supabase SQL editor with sample JWT tokens
