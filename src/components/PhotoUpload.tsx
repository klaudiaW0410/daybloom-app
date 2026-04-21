import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Camera } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface PhotoUploadProps {
  userId: string;
  date: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ userId, date }) => {
  const [photo, setPhoto] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPhoto();
  }, [date]);

  const fetchPhoto = async () => {
    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (data) {
      setPhoto(data);
      setCaption(data.caption || '');
    } else {
      setPhoto(null);
      setCaption('');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${date}_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase
        .from('photos')
        .insert({
          user_id: userId,
          date,
          storage_path: filePath,
          caption: ''
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setPhoto(data);
      toast('Photo uploaded!', 'success');
    } catch (error: any) {
      toast(error.message, 'danger');
    } finally {
      setUploading(false);
    }
  };

  const updateCaption = async () => {
    if (!photo) return;
    const { error } = await supabase
      .from('photos')
      .update({ caption })
      .eq('id', photo.id);
    
    if (error) toast(error.message, 'danger');
    else toast('Caption saved', 'success');
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <section className="card" style={{ marginTop: '24px' }}>
      <h2 className="title-medium" style={{ marginBottom: '16px' }}>Photo of the day</h2>
      
      {photo ? (
        <div style={{ position: 'relative' }}>
          <img 
            src={getPublicUrl(photo.storage_path)} 
            alt="Today" 
            style={{ width: '100%', borderRadius: '12px', height: '300px', objectFit: 'cover' }}
          />
          <input 
            type="text" 
            placeholder="Add a caption..." 
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={updateCaption}
            style={{ width: '100%', marginTop: '12px', background: 'transparent', borderBottom: '1px solid var(--border-color)', borderRadius: '0' }}
          />
        </div>
      ) : (
        <label style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '200px', 
          border: '2px dashed var(--border-color)', 
          borderRadius: '12px',
          cursor: 'pointer',
          gap: '12px'
        }}>
          <Camera size={32} color="var(--text-secondary)" />
          <span className="text-small">{uploading ? 'Uploading...' : 'Tap to upload photo'}</span>
          <input type="file" accept="image/*" hidden onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </section>
  );
};
