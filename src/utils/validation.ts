import DOMPurify from 'dompurify';

export const validators = {
  // Sanitize text to prevent XSS
  sanitizeText: (text: string, maxLength: number = 500): string => {
    if (typeof text !== 'string') return '';
    const cleaned = text.trim().slice(0, maxLength);
    return DOMPurify.sanitize(cleaned, { ALLOWED_TAGS: [] });
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Validate beat data before submission
  validateBeatData: (data: any) => {
    const errors: string[] = [];

    // Title validation
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > 200) {
      errors.push('Title must be under 200 characters');
    }

    // Price validation
    if (data.price) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price < 0 || price > 10000) {
        errors.push('Price must be a valid number between 0 and 10000');
      }
    }

    // BPM validation
    if (data.bpm) {
      const bpm = parseInt(data.bpm);
      if (isNaN(bpm) || bpm < 40 || bpm > 320) {
        errors.push('BPM must be between 40 and 320');
      }
    }

    // Genre validation
    if (data.genre && data.genre.length > 100) {
      errors.push('Genre must be under 100 characters');
    }

    // Duration validation
    if (data.duration && !/^\d+:\d{2}$/.test(data.duration)) {
      errors.push('Invalid duration format');
    }

    // Type validation
    if (data.type && !['beat', 'remix'].includes(data.type)) {
      errors.push('Invalid type');
    }

    return { isValid: errors.length === 0, errors };
  },

  // Validate file before upload
  validateFile: (file: File, type: 'audio' | 'image') => {
    const errors: string[] = [];
    const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    const maxSize = type === 'audio' ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      errors.push(`File size must be under ${maxSize / 1024 / 1024}MB`);
    }

    if (type === 'audio') {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/x-wav'];
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

  // Validate email submission
  validateEmailSubmission: (email: string) => {
    const errors: string[] = [];

    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!validators.isValidEmail(email)) {
      errors.push('Please enter a valid email address');
    }

    return { isValid: errors.length === 0, errors };
  },

  // Validate price (for beats)
  validatePrice: (price: string | number): { isValid: boolean; error?: string } => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numPrice)) {
      return { isValid: false, error: 'Price must be a valid number' };
    }

    if (numPrice < 0) {
      return { isValid: false, error: 'Price cannot be negative' };
    }

    if (numPrice > 10000) {
      return { isValid: false, error: 'Price is too high (max $10,000)' };
    }

    return { isValid: true };
  },

  // Check if string is URL safe
  isSafeString: (str: string, maxLength: number = 500): boolean => {
    if (typeof str !== 'string') return false;
    if (str.length === 0 || str.length > maxLength) return false;
    // Check for common XSS patterns
    const xssPatterns = [/<script/i, /javascript:/i, /onerror=/i, /onclick=/i];
    return !xssPatterns.some(pattern => pattern.test(str));
  },
};
