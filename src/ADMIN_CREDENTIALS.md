# 🔐 shhmaart Admin Credentials

## Access Instructions

### Method 1: Secret Keyboard Shortcut
**Press:** `Ctrl + Shift + A` (Windows/Linux) or `Cmd + Shift + A` (Mac)

This works from anywhere on the website and will instantly open the admin login panel.

---

## Login Credentials

**Password:** Stored in environment variable `ADMIN_PASSWORD`

The password is **NOT** hardcoded for security. You set this in your Supabase environment variables.

To view or update your password:
1. Go to your Supabase Dashboard
2. Navigate to: **Edge Functions** → **Environment Variables**
3. Find: `ADMIN_PASSWORD`
4. The value there is your current admin password

---

## Security Features

✅ **Hidden UI** - No visible admin button for public users  
✅ **Secret Shortcut** - Only accessible via keyboard combination  
✅ **Environment Variable** - Password stored securely, not in code  
✅ **No Default Password** - Must be set manually in Supabase  

---

## Admin Panel Features

Once logged in, you can:
- 🎵 Upload beats and remixes with audio files
- 🖼️ Add cover images for tracks
- ✏️ Edit existing music metadata (title, BPM, genre)
- 🗑️ Delete tracks
- 💼 Manage services (add/edit/delete)
- 📧 View email list (Music vs Marketing subscribers)
- 🎨 Update hero section content
- 📊 View listen count statistics

---

## Important Notes

⚠️ **Keep this file private** - Contains sensitive access information  
⚠️ **Desktop only** - Mobile menu doesn't show admin access  
⚠️ **Supabase required** - Password must be set in Supabase dashboard  

---

## Troubleshooting

**Can't log in?**
1. Verify `ADMIN_PASSWORD` is set in Supabase Edge Functions environment variables
2. Check the password doesn't have extra spaces
3. Try the keyboard shortcut again

**Forgot password?**
1. Go to Supabase Dashboard
2. Edge Functions → Environment Variables
3. Edit `ADMIN_PASSWORD` to a new value
4. Redeploy if necessary

---

**Last Updated:** March 4, 2026  
**Platform:** shhmaart Professional Music & Digital Marketing
