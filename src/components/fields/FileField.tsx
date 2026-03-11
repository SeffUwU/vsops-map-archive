import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteImageAction } from '@/server/actions/uploads/images';
import { Loader2, X } from 'lucide-react';
import { ChangeEvent, useState } from 'react';

interface FileUploadFieldProps {
  label: string;
  value: string;
  onUploadSuccess: (id: string) => void;
  onManualDelete: (id: string) => void;
  maxFiles?: number;
}

export function FileUploadField({
  label,
  value,
  onUploadSuccess,
  onManualDelete,
  maxFiles = 10,
}: FileUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadedIds = value ? value.split(',').filter(Boolean) : [];

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || uploadedIds.length + files.length > maxFiles) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/images', { method: 'POST', body: formData });
        const data = await response.json();

        if (data.id) {
          onUploadSuccess(data.id);
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

  return (
    <div className="flex flex-col gap-2 col-span-4">
      <Label>{label}</Label>

      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          multiple
          disabled={isUploading || uploadedIds.length >= maxFiles}
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
      </div>
      {uploadedIds.length > 0 && (
        <div className="grid grid-cols-5 gap-2 mt-2">
          {uploadedIds.map((id) => (
            <div key={id} className="relative group rounded-md border overflow-hidden aspect-square">
              <img src={`/api/images/${id}`} alt="Uploaded asset" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => removeImage(id)}
                className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
