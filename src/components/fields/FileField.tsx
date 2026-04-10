import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteImageAction, updateImageDescriptionAction } from '@/server/actions/uploads/images';
import { MediaItem } from '@/types/map/vsmap';
import { Loader2, Pencil, X } from 'lucide-react';
import { ChangeEvent, useState } from 'react';

interface FileUploadFieldProps {
  label: string;
  value: MediaItem[];
  onUploadSuccess: (mediaItem: MediaItem) => void;
  onManualDelete: (id: string) => void;
  maxFiles?: number;
}

export function FileUploadField({
  label,
  value,
  onUploadSuccess,
  onManualDelete,
  maxFiles = 100,
}: FileUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const uploadedItems = Array.isArray(value) ? value : [];

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || uploadedItems.length + files.length > maxFiles) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/images', { method: 'POST', body: formData });
        const data = await response.json();

        if (data.id) {
          const mediaItem: MediaItem = {
            id: data.id,
            mimeType: data.mimeType,
            description: data.description || '',
            used: false,
            createdAt: new Date(),
          };
          onUploadSuccess(mediaItem);
        }
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = async (idToRemove: string) => {
    await deleteImageAction(idToRemove);
    onManualDelete(idToRemove);
  };

  const startEditingDescription = (mediaItem: MediaItem) => {
    setEditingId(mediaItem.id);
    setEditingDescription(mediaItem.description || '');
  };

  const saveDescription = async (mediaId: string) => {
    const result = await updateImageDescriptionAction(mediaId, editingDescription);
    if (!result.is_error) {
      onUploadSuccess({
        id: mediaId,
        mimeType: uploadedItems.find((item) => item.id === mediaId)?.mimeType || '',
        description: editingDescription,
        used: false,
        createdAt: uploadedItems.find((item) => item.id === mediaId)?.createdAt || new Date(),
      });
    }
    setEditingId(null);
    setEditingDescription('');
  };

  return (
    <div className="flex flex-col gap-2 col-span-4">
      <Label>{label}</Label>

      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          multiple
          disabled={isUploading || uploadedItems.length >= maxFiles}
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
      </div>
      {uploadedItems.length > 0 && (
        <div className="grid grid-cols-5 gap-2 mt-2 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
          {uploadedItems.map((mediaItem) => (
            <div key={mediaItem.id} className="relative group">
              <div className="relative rounded-md border overflow-hidden aspect-square">
                <img src={`/api/images/${mediaItem.id}`} alt="Uploaded asset" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => removeImage(mediaItem.id)}
                  className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => startEditingDescription(mediaItem)}
                  className="absolute top-1 left-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <div className="mt-1 px-0.5">
                {editingId === mediaItem.id ? (
                  <div className="flex gap-1">
                    <Input
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="Description..."
                      className="absolute w-80 h-6 text-xs z-40 bg-black"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveDescription(mediaItem.id);
                        } else if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditingDescription('');
                        }
                      }}
                      onBlur={() => saveDescription(mediaItem.id)}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground truncate" title={mediaItem.description || ''}>
                    {mediaItem.description || 'No description'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
