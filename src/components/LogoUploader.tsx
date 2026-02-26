import { useState } from 'react';
import { Upload, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function LogoUploader() {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file (PNG, JPG, etc.)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage('File size must be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');
      formData.append('bucket', 'make-fe24c337-email-assets');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/upload-logo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setLogoUrl(data.publicUrl);
      setMessage('✅ Logo uploaded successfully! It will now appear in all emails.');

      // Store logo URL in KV store for easy access
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/set-logo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logoUrl: data.publicUrl }),
        }
      );
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage('❌ Failed to upload logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const fetchCurrentLogo = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/get-logo`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
          setPreviewUrl(data.logoUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  useState(() => {
    fetchCurrentLogo();
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Email Logo</h2>
        <p className="text-gray-400">Upload your logo to appear in all email communications</p>
      </div>

      {/* Current Logo Preview */}
      {previewUrl && (
        <div className="bg-white/5 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-400 mb-4">Current Logo</p>
          <div className="inline-block">
            <img
              src={previewUrl}
              alt="Logo Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
            />
          </div>
          {logoUrl && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 break-all">{logoUrl}</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white/5 rounded-lg p-8 border-2 border-dashed border-white/20 hover:border-white/40 transition-all">
        <label className="cursor-pointer block text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          
          <div className="space-y-4">
            {uploading ? (
              <Loader2 className="w-16 h-16 text-white mx-auto animate-spin" />
            ) : (
              <Upload className="w-16 h-16 text-gray-400 mx-auto" />
            )}
            
            <div>
              <p className="text-lg font-semibold text-white mb-2">
                {uploading ? 'Uploading...' : 'Click to Upload Logo'}
              </p>
              <p className="text-sm text-gray-400">
                PNG or JPG • Max 2MB • Square image recommended
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>✓ 120x120 pixels ideal</span>
              <span>✓ Transparent PNG works best</span>
              <span>✓ Will appear in all emails</span>
            </div>
          </div>
        </label>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">📧 Email Preview</h3>
        <p className="text-sm text-gray-300 mb-2">
          Your logo will appear at the top of:
        </p>
        <ul className="text-sm text-gray-400 space-y-1 ml-4">
          <li>• Music download thank you emails</li>
          <li>• Service booking confirmation emails</li>
          <li>• All future email communications</li>
        </ul>
      </div>
    </div>
  );
}
