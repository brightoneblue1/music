import { useState, useEffect, useRef } from 'react';
import { Upload, Music, Trash2, Loader2, Plus, File, Image as ImageIcon, Edit2, DollarSign, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Beat {
  id: string;
  title: string;
  genre: string;
  bpm: string;
  duration: string;
  type: 'beat' | 'remix';
  audioUrl: string;
  imageUrl: string;
  price?: string;
}

export function BeatUpload() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [audioDragActive, setAudioDragActive] = useState(false);
  const [imageDragActive, setImageDragActive] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    bpm: '',
    duration: '',
    type: 'beat' as 'beat' | 'remix',
    audioUrl: '',
    imageUrl: '',
    price: '',
  });

  useEffect(() => {
    fetchBeats();
  }, []);

  const fetchBeats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/beats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setBeats(data.beats || []);
      }
    } catch (error) {
      console.error('Error fetching beats:', error);
    }
  };

  const getAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      
      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      
      audio.onerror = () => {
        resolve('3:00'); // Default duration if detection fails
      };
      
      audio.src = URL.createObjectURL(file);
    });
  };

  const uploadFileToStorage = async (file: File, type: 'audio' | 'image'): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/upload-file`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload ${type}. Please try again.`);
      return null;
    }
  };

  const handleAudioUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }

    setUploadingAudio(true);

    // Get duration
    const duration = await getAudioDuration(file);
    
    // Upload to storage
    const url = await uploadFileToStorage(file, 'audio');

    if (url) {
      // Auto-fill title from filename if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
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

    setUploadingAudio(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingImage(true);

    const url = await uploadFileToStorage(file, 'image');

    if (url) {
      setFormData(prev => ({ ...prev, imageUrl: url }));
    }

    setUploadingImage(false);
  };

  const handleAudioDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAudioDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleAudioUpload(file);
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.audioUrl) {
      alert('Please upload an audio file');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/beats`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

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
      console.error('Error adding beat:', error);
      alert('Error adding beat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this beat?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/beats/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        fetchBeats();
      }
    } catch (error) {
      console.error('Error deleting beat:', error);
    }
  };

  const handleEdit = (beat: Beat) => {
    setEditingBeat(beat);
    setFormData({
      title: beat.title,
      genre: beat.genre,
      bpm: beat.bpm,
      duration: beat.duration,
      type: beat.type,
      audioUrl: beat.audioUrl,
      imageUrl: beat.imageUrl || '',
      price: beat.price || '',
    });
    setShowForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBeat) return;
    if (!formData.audioUrl) {
      alert('Please upload an audio file');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/beats/${editingBeat.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

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
        setEditingBeat(null);
        setShowForm(false);
        fetchBeats();
      } else {
        alert('Failed to update beat');
      }
    } catch (error) {
      console.error('Error updating beat:', error);
      alert('Error updating beat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingBeat(null);
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
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage Beats & Remixes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add New</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={editingBeat ? handleUpdate : handleSubmit} className="bg-white/5 rounded-lg p-6 space-y-6">
          {editingBeat && (
            <div className="bg-blue-500/20 border-2 border-blue-500/50 rounded-lg p-4 mb-4">
              <p className="text-blue-300 font-semibold">✏️ Editing: {editingBeat.title}</p>
            </div>
          )}
          {/* Audio File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Audio File * {uploadingAudio && <span className="text-gray-500">(Uploading...)</span>}
            </label>
            <div
              onDrop={handleAudioDrop}
              onDragOver={handleDragOver}
              onDragEnter={() => setAudioDragActive(true)}
              onDragLeave={() => setAudioDragActive(false)}
              onClick={() => audioInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                audioDragActive 
                  ? 'border-white bg-white/10' 
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
            >
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                className="hidden"
              />
              {uploadingAudio ? (
                <Loader2 className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
              ) : formData.audioUrl ? (
                <File className="w-12 h-12 text-green-500 mx-auto mb-4" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              )}
              <p className="text-white font-medium">
                {formData.audioUrl ? 'Audio file uploaded successfully!' : 'Drag & drop audio file or click to browse'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Supports MP3, WAV, OGG formats
              </p>
              {formData.duration && (
                <p className="text-sm text-green-400 mt-2">
                  Duration: {formData.duration}
                </p>
              )}
            </div>
          </div>

          {/* Image File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cover Image (Optional) {uploadingImage && <span className="text-gray-500">(Uploading...)</span>}
            </label>
            <div
              onDrop={handleImageDrop}
              onDragOver={handleDragOver}
              onDragEnter={() => setImageDragActive(true)}
              onDragLeave={() => setImageDragActive(false)}
              onClick={() => imageInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                imageDragActive 
                  ? 'border-white bg-white/10' 
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
              />
              {uploadingImage ? (
                <Loader2 className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
              ) : formData.imageUrl ? (
                <div className="mb-4">
                  <img src={formData.imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto" />
                </div>
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              )}
              <p className="text-white font-medium">
                {formData.imageUrl ? 'Cover image uploaded!' : 'Drag & drop cover image or click to browse'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Supports JPG, PNG, WebP formats
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre *</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">BPM *</label>
              <input
                type="text"
                value={formData.bpm}
                onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                placeholder="120"
                className="w-full px-4 py-2 bg-white/5 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'beat' | 'remix' })}
                className="w-full px-4 py-2 bg-white/5 border-2 border-white/20 rounded-lg text-white focus:outline-none focus:border-white"
              >
                <option value="beat">Beat</option>
                <option value="remix">Remix</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Price (Optional)</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., $29.99 or Free"
                className="w-full px-4 py-2 bg-white/5 border-2 border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
              />
              <p className="text-xs text-gray-500 mt-1">Enter price or leave empty if free</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading || uploadingAudio || uploadingImage}
              className="flex items-center space-x-2 bg-white hover:bg-gray-200 disabled:bg-white/50 text-black px-6 py-2 rounded-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{editingBeat ? 'Updating...' : 'Adding...'}</span>
                </>
              ) : (
                <>
                  {editingBeat ? <Edit2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  <span>{editingBeat ? 'Update Beat' : 'Add Beat'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={editingBeat ? handleCancelEdit : () => setShowForm(false)}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Current Beats ({beats.length})</h3>
        {beats.map((beat) => (
          <div
            key={beat.id}
            className="bg-white/5 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-all"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-white font-semibold">{beat.title}</h4>
                  {beat.price && (
                    <span className="flex items-center gap-1 text-green-400 text-sm font-semibold bg-green-500/10 px-2 py-1 rounded">
                      <DollarSign className="w-4 h-4" />
                      {beat.price}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {beat.genre} • {beat.bpm} BPM • {beat.duration} • {beat.type}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => handleEdit(beat)}
                className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                title="Edit beat"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(beat.id)}
                className="text-red-400 hover:text-red-300 transition-colors p-2"
                title="Delete beat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {beats.length === 0 && (
          <p className="text-gray-400 text-center py-8">No beats added yet</p>
        )}
      </div>
    </div>
  );
}