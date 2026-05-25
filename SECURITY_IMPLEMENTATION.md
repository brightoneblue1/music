# Security Improvements Implementation Guide

## Priority 1: Frontend Authentication & Authorization

### 1. Add Session Management

**Create:** `src/utils/auth.ts`

```typescript
// Session token storage & validation
interface SessionToken {
  token: string;
  expiresAt: number;
}

export const authTokens = {
  set: (token: string, expiresIn: number = 3600000) => {
    const expiresAt = Date.now() + expiresIn;
    sessionStorage.setItem('adminToken', token);
    sessionStorage.setItem('adminTokenExpiry', expiresAt.toString());
  },

  get: (): string | null => {
    const token = sessionStorage.getItem('adminToken');
    const expiry = sessionStorage.getItem('adminTokenExpiry');
    
    if (!token || !expiry) return null;
    if (Date.now() > parseInt(expiry)) {
      authTokens.clear();
      return null;
    }
    
    return token;
  },

  clear: () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminTokenExpiry');
  },

  isValid: (): boolean => !!authTokens.get(),
};
```

### 2. Update AdminLogin Component

**Modify:** [src/components/AdminLogin.tsx](src/components/AdminLogin.tsx)

Replace the login handler:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/admin-login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      }
    );

    const data = await response.json();

    if (response.ok && data.success && data.token) {
      // Store session token (NOT public anon key)
      authTokens.set(data.token, data.expiresIn);
      onAuthenticate();
    } else if (response.status === 429) {
      setError('Too many attempts. Please wait 15 minutes.');
    } else {
      setError('Invalid password');
    }
  } catch (err) {
    console.error('Login error:', err);
    setError('Login failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Create API Wrapper with Session Token

**Create:** `src/utils/api.ts`

```typescript
import { projectId } from './supabase/info';
import { authTokens } from './auth';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function secureApi(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { requiresAuth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});
  headers.set('Content-Type', 'application/json');

  if (requiresAuth) {
    const token = authTokens.get();
    if (!token) {
      throw new Error('Authentication required. Please login.');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    authTokens.clear();
    window.location.href = '/'; // Redirect to home
    throw new Error('Session expired. Please login again.');
  }

  return response;
}
```

---

## Priority 2: Input Validation & Sanitization

### Add DOMPurify

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**Create:** `src/utils/validation.ts`

```typescript
import DOMPurify from 'dompurify';

export const validators = {
  // Sanitize text to prevent XSS
  sanitizeText: (text: string, maxLength: number = 500): string => {
    if (typeof text !== 'string') return '';
    const cleaned = text.trim().slice(0, maxLength);
    return DOMPurify.sanitize(cleaned, { ALLOWED_TAGS: [] });
  },

  // Validate email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Validate beat data
  validateBeatData: (data: any) => {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > 200) {
      errors.push('Title must be under 200 characters');
    }

    if (data.price) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price < 0 || price > 10000) {
        errors.push('Price must be a valid number between 0 and 10000');
      }
    }

    if (data.bpm) {
      const bpm = parseInt(data.bpm);
      if (isNaN(bpm) || bpm < 40 || bpm > 320) {
        errors.push('BPM must be between 40 and 320');
      }
    }

    if (data.genre && data.genre.length > 100) {
      errors.push('Genre must be under 100 characters');
    }

    return { isValid: errors.length === 0, errors };
  },

  // Validate file
  validateFile: (file: File, type: 'audio' | 'image') => {
    const errors: string[] = [];
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB

    if (file.size > MAX_SIZE) {
      errors.push(`File size must be under ${MAX_SIZE / 1024 / 1024}MB`);
    }

    if (type === 'audio') {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4'];
      if (!validTypes.includes(file.type)) {
        errors.push('Only MP3, WAV, FLAC, or M4A files are allowed');
      }
    } else if (type === 'image') {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        errors.push('Only JPEG, PNG, or WebP images are allowed');
      }
    }

    return { isValid: errors.length === 0, errors };
  },
};
```

---

## Priority 3: Security Headers

### Update index.html

**Modify:** [index.html](index.html)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Security Headers -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.paypal.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://www.paypal.com https://*.stripe.com; frame-src https://www.paypal.com https://*.stripe.com" />
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta http-equiv="X-Frame-Options" content="DENY" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    
    <title>Professional Music Marketing Website</title>
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Update vite.config.ts

**Modify:** [vite.config.ts](vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    },
  },
  // ... rest of config
});
```

---

## Priority 4: File Upload Validation

### Update BeatUpload Component

**Modify:** [src/components/BeatUpload.tsx](src/components/BeatUpload.tsx)

```typescript
import { validators } from '../utils/validation';
import { secureApi } from '../utils/api';

const handleAudioUpload = async (file: File) => {
  if (!file) return;

  // Validate file
  const { isValid, errors } = validators.validateFile(file, 'audio');
  if (!isValid) {
    errors.forEach(err => alert(err));
    return;
  }

  setUploadingAudio(true);

  try {
    // Get duration
    const duration = await getAudioDuration(file);
    
    // Upload to storage
    const url = await uploadFileToStorage(file, 'audio');

    if (url) {
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ 
          ...prev, 
          audioUrl: url, 
          duration,
          title: fileName 
        }));
      } else {
        setFormData(prev => ({ ...prev, audioUrl: url, duration }));
      }
    }
  } catch (error) {
    alert('Upload failed: ' + (error as Error).message);
  } finally {
    setUploadingAudio(false);
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.audioUrl) {
    alert('Please upload an audio file');
    return;
  }

  // Validate beat data
  const { isValid, errors } = validators.validateBeatData(formData);
  if (!isValid) {
    errors.forEach(err => alert(err));
    return;
  }

  setIsLoading(true);

  try {
    // Sanitize text fields
    const sanitizedData = {
      ...formData,
      title: validators.sanitizeText(formData.title, 200),
      genre: validators.sanitizeText(formData.genre, 100),
    };

    const response = await secureApi('/beats', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
      requiresAuth: true,
    });

    if (response.ok) {
      setFormData({
        title: '',
        genre: '',
        bpm: '',
        duration: '',
        type: 'beat',
        audioUrl: '',
        imageUrl: '',
        price: '',
      });
      setShowForm(false);
      fetchBeats();
    } else {
      alert('Failed to add beat');
    }
  } catch (error) {
    alert('Error: ' + (error as Error).message);
  } finally {
    setIsLoading(false);
  }
};
```

---

## Priority 5: Improved .gitignore

**Replace:** [.gitignore](.gitignore)

```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local
.env.production.local

# Build outputs
/dist
/build
/.next
.vite/

# IDE & Editor
.vscode/
.idea/
*.swp
*.swo
*.swn
*~
.DS_Store
.project
.pydevproject
.settings
*.sublime-project
*.sublime-workspace

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
.nyc_output

# Misc
.cache
.parcel-cache
dist-ssr
*.local

# Credentials (in case accidentally added)
ADMIN_CREDENTIALS.md
credentials.json
secrets.json
```

---

## Backend Security Checklist

Ask your backend team to implement:

- [ ] **Authentication Endpoint**
  - Validate password against hashed stored password
  - Return JWT token with 1-hour expiry
  - Implement rate limiting (5 attempts → 15 min lockout)
  - Log all attempts (success & failure)

- [ ] **Authorization Middleware**
  - Verify JWT token on all protected routes
  - Check if user is admin
  - Reject requests without valid token (401)
  - Reject expired tokens (401)

- [ ] **File Upload Validation**
  - Check file size (max 100MB)
  - Validate MIME type (whitelist only)
  - Check magic bytes (not just extension)
  - Scan for malware
  - Store in CDN, not publicly accessible

- [ ] **Request Validation**
  - Validate all input parameters
  - Check data types
  - Sanitize strings
  - Check price is reasonable

- [ ] **Payment Security**
  - Verify Stripe/PayPal signatures
  - Check payment actually completed
  - Verify amount matches
  - Prevent replay attacks

- [ ] **CORS Configuration**
  - Only allow your domain(s)
  - Use appropriate methods (GET, POST, etc.)
  - Include credentials handling

- [ ] **Rate Limiting**
  - API endpoint rate limits
  - Per-IP limits
  - Login attempt limits

- [ ] **Audit Logging**
  - Log all admin actions
  - Include timestamp, user, action, details
  - Store in secure database

- [ ] **Security Headers**
  - CSP
  - X-Frame-Options
  - X-Content-Type-Options
  - HSTS
  - Referrer-Policy

---

## Testing Security Fixes

```bash
# 1. Test XSS protection
# Try: <script>alert('xss')</script> in beat title

# 2. Test auth
# Remove token from sessionStorage, try API call → should fail

# 3. Test file upload
# Try uploading executable (.exe, .bat) → should fail

# 4. Check headers
# Open DevTools → Network → Response Headers → look for security headers

# 5. Test rate limiting
# Try logging in with wrong password 10 times → should lockout

# 6. Test CORS
# Make request from different domain → should fail

# 7. Validate no console errors
# Open DevTools → Console → should be clean
```

---

## Quick Wins (Do Today)

1. ✅ Update .gitignore
2. ✅ Add DOMPurify
3. ✅ Add input validation
4. ✅ Update HTML security headers
5. ✅ Create auth.ts & api.ts utilities

## Medium Term (This Week)

1. 🔄 Implement session tokens
2. 🔄 Update components to use secureApi
3. 🔄 Backend implements authentication
4. 🔄 Backend implements authorization

## Long Term (Next Month)

1. 🎯 Add 2FA
2. 🎯 Implement webhook verification
3. 🎯 Add security monitoring
4. 🎯 Penetration testing
