# Clerk + Supabase Integration Setup Guide

This guide will help you set up Clerk authentication with Supabase database for the UGC bounty platform.

## Prerequisites

- Node.js 18+ installed
- Git access to the repository
- Clerk account (get credentials from team lead)
- Supabase account (get credentials from team lead)

## 1. Environment Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk URLs (optional)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Supabase Database Setup

### Step 1: Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down your project URL and anon key

### Step 2: Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase/schema.sql`
3. Click **Run** to create tables and policies

### Step 3: Configure Authentication
**Skip this step** - We're using Clerk's native Supabase integration instead of Custom JWT configuration.

## 4. Clerk Configuration

### Step 1: Enable Native Supabase Integration
1. In Clerk dashboard, go to **Settings** → **Integrations**
2. Find **Supabase** and click **Enable**
3. Enter your Supabase credentials:
   - **Supabase Project URL**: `https://your-project-ref.supabase.co`
   - **Supabase Anon Key**: `your_supabase_anon_key`
4. Click **Save**

### Step 2: Configure Supabase Third-Party Auth
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Scroll down to **Third-party providers**
3. Find **Clerk** and click **Enable**
4. Enter your Clerk credentials:
   - **Clerk Publishable Key**: `pk_test_...`
   - **Clerk Secret Key**: `sk_test_...`
5. Click **Save**

**Note**: We're using Clerk's native Supabase integration instead of custom JWT templates to avoid reserved claim conflicts.

## 5. Test the Integration

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Test Authentication
1. Go to `http://localhost:3000`
2. Click the user button to sign in
3. Create a Clerk account
4. Verify you can see the homepage with authentication

### Step 3: Test Database Connection
1. Sign in to your account
2. Check if the homepage shows "Loading profile..." or profile data
3. Check browser console for any errors

## 6. API Endpoints

The following API endpoints are available:

### Profiles
- `GET /api/profiles` - Get current user's profile
- `POST /api/profiles` - Create or update user profile

### Social Accounts
- `GET /api/social-accounts` - Get current user's social accounts
- `POST /api/social-accounts` - Add a new social account

## 7. Database Schema

### Tables Created:
- **profiles**: User profile information
- **social_accounts**: Linked social media accounts

### Security:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Policies use Clerk JWT `sub` claim for authorization

## 8. Troubleshooting

### Common Issues:

**"permission denied to set parameter app.jwt_secret"**
- This error is fixed in the schema - don't run old SQL commands
- Configure JWT secret through Supabase dashboard instead

**Authentication not working**
- Check environment variables are set correctly
- Verify Clerk JWT template is named `supabase`
- Ensure Supabase Custom JWT provider is configured

**Database connection errors**
- Verify Supabase URL and anon key are correct
- Check that RLS policies are properly set up
- Ensure Clerk JWT contains correct claims

**API routes returning 401**
- Make sure you're signed in with Clerk
- Check that JWT template is configured correctly
- Verify Supabase can validate Clerk JWTs

## 9. Development Workflow

### Adding New Features:
1. Update database schema in `supabase/schema.sql`
2. Update TypeScript types in `lib/database.types.ts`
3. Create API routes in `app/api/`
4. Use Supabase client hooks in components

### Testing:
1. Always test with signed-in users
2. Verify RLS policies work correctly
3. Check browser console for errors
4. Test API endpoints with Postman/curl

## 10. Team Credentials

**Get these from your team lead:**

### Clerk:
- Publishable Key: `pk_test_...`
- Secret Key: `sk_test_...`
- Domain: `your-app.clerk.dev`

### Supabase:
- Project URL: `https://your-project-ref.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- JWT Secret: (for Supabase configuration)

## 11. Next Steps

Once setup is complete:
1. Create user profiles
2. Add social media accounts
3. Build bounty creation features
4. Implement view tracking
5. Add payment integration

## Support

If you encounter issues:
1. Check this guide first
2. Review browser console errors
3. Check Supabase logs
4. Ask team lead for help
5. Refer to [Clerk + Supabase docs](https://clerk.dev/docs/integrations/supabase)
