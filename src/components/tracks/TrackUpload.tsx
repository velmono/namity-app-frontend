import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trackService } from '../../services/tracks';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface TrackUploadProps {
  onUploadComplete: () => void;
}

export const TrackUpload: React.FC<TrackUploadProps> = ({ onUploadComplete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        if (!title && selectedFile.name) {
          setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
        }
      } else {
        toast({
          title: t('invalid_file_type'),
          description: t('select_audio_file'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setIsUploading(true);
    try {
      await trackService.uploadTrack(title.trim(), file, description.trim() || undefined);
      toast({
        title: t('track_uploaded_success'),
        description: t('track_uploaded_desc'),
      });
      setTitle('');
      setDescription('');
      setFile(null);
      onUploadComplete();
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: t('upload_failed'),
        description: t('try_again'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setTitle('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">{t('upload_new_track')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{t('audio_file')}</label>
              {!file ? (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center relative">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400 mb-2">{t('click_to_upload')}</p>
                  <p className="text-gray-500 text-sm">{t('audio_formats')}</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 2,
                    }}
                  />
                </div>
              ) : (
                <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-gray-400 hover:text-white"
                    aria-label={t('remove_file')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{t('title_label')}</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('title_placeholder')}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">{t('description_label')}</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('description_placeholder')}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                rows={3}
              />
            </div>
            {/* Submit button */}
            <Button
              type="submit"
              disabled={!file || !title.trim() || isUploading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isUploading ? t('uploading') : t('upload_track_btn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};