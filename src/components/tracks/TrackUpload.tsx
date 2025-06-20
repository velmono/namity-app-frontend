import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trackService } from '../../services/tracks';
import { useToast } from '../../hooks/use-toast';

interface TrackUploadProps {
  onUploadComplete: () => void;
}

export const TrackUpload: React.FC<TrackUploadProps> = ({ onUploadComplete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
          title: 'Invalid file type',
          description: 'Please select an audio file',
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
        title: 'Track uploaded successfully',
        description: 'Your track is now available in your library',
      });
      setTitle('');
      setDescription('');
      setFile(null);
      onUploadComplete();
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Please try again',
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
          <CardTitle className="text-white">Upload New Track</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Audio File</label>
              {!file ? (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center relative">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm">MP3, WAV, FLAC, or other audio formats</p>
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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Title</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter track title"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your track..."
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
              {isUploading ? 'Uploading...' : 'Upload Track'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};