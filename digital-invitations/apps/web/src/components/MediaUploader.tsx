'use client';

import { useState, useRef } from 'react';
import { mediaAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { mediaDisplayUrl, mediaIsImage } from '@/lib/format';

interface Media {
  id: string;
  originalUrl: string;
  optimizedUrl?: string | null;
  fileName: string;
  mimeType: string;
  isCover: boolean;
  galleryOrder: number;
}

interface MediaUploaderProps {
  invitationId: string;
  media: Media[];
  onUpload: () => void;
  onDelete: (mediaId: string) => void;
  onSetCover: (mediaId: string) => void;
  onReorder: (mediaIds: string[]) => void;
}

export default function MediaUploader({
  invitationId,
  media,
  onUpload,
  onDelete,
  onSetCover,
  onReorder,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        continue;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }

      try {
        setUploading(true);
        await mediaAPI.upload(invitationId, file);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error: any) {
        toast.error(error.response?.data?.error || `Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    onUpload();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const newMedia = [...media];
    [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
    onReorder(newMedia.map((m) => m.id));
  };

  const handleMoveRight = (index: number) => {
    if (index === media.length - 1) return;
    const newMedia = [...media];
    [newMedia[index], newMedia[index + 1]] = [newMedia[index + 1], newMedia[index]];
    onReorder(newMedia.map((m) => m.id));
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <div className="text-4xl mb-4">📸</div>
        <p className="text-gray-600 mb-2">
          {uploading ? 'Uploading...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Supports: JPG, PNG, GIF, WebP (max 10MB each)
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Select Files'}
        </button>
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">🖼️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media yet</h3>
          <p className="text-gray-500">Upload images to use in your invitation</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <div
              key={item.id}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                item.isCover ? 'border-primary-500' : 'border-transparent'
              }`}
            >
              {mediaIsImage(item) ? (
                <img
                  src={mediaDisplayUrl(item)}
                  alt={item.fileName}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <video
                  src={mediaDisplayUrl(item)}
                  className="w-full h-32 object-cover"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  {!item.isCover && (
                    <button
                      onClick={() => onSetCover(item.id)}
                      className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                      title="Set as cover"
                    >
                      Cover
                    </button>
                  )}
                  <button
                    onClick={() => handleMoveLeft(index)}
                    disabled={index === 0}
                    className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
                    title="Move left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleMoveRight(index)}
                    disabled={index === media.length - 1}
                    className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
                    title="Move right"
                  >
                    →
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this media?')) {
                        onDelete(item.id);
                      }
                    }}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-red-700"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Cover Badge */}
              {item.isCover && (
                <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
