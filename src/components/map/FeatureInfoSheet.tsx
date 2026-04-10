import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { IMedia, ISettlement } from '@/entities';
import { toast } from '@/hooks/use-toast';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Calendar, ChevronLeft, ChevronRight, Copy, Languages, Loader2 } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

const SUPPORTED_LANGUAGES = [
  { label: 'Russian', value: 'ru' },
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Chinese', value: 'zh-CN' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
];

export interface InfoSheetField {
  key: string;
  label: string;
  value: string | React.ReactNode;
}

export interface InfoSheetData {
  title: string;
  description?: string;
  fields?: InfoSheetField[];
  images?: IMedia[];
  raw?: Record<string, any>;
}

interface FeatureInfoSheetProps {
  data: InfoSheetData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfoSheet({ data, open, onOpenChange }: FeatureInfoSheetProps) {
  const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState('ru');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setTranslatedDescription(null);
  }, [data, targetLang]);

  // Collect images from data.images or data.raw.images
  const allImages = useMemo((): IMedia[] => {
    if (data?.images && Array.isArray(data.images)) return data.images;
    if (data?.raw?.images && Array.isArray(data.raw.images)) return data.raw.images;
    return [];
  }, [data?.images, data?.raw?.images]);

  const imagesByDate = useMemo(() => {
    if (allImages.length === 0) return {};

    const grouped: Record<string, IMedia[]> = {};

    allImages.forEach((mediaObj) => {
      const date = mediaObj.createdAt ? new Date(mediaObj.createdAt).toISOString().split('T')[0] : 'Unknown';

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(mediaObj);
    });

    const sorted = Object.entries(grouped)
      .sort(([a], [b]) => {
        if (a === 'Unknown') return 1;
        if (b === 'Unknown') return -1;
        return b.localeCompare(a);
      })
      .reduce(
        (acc, [date, items]) => {
          acc[date] = items;
          return acc;
        },
        {} as typeof grouped,
      );

    return sorted;
  }, [allImages]);

  const availableDates = useMemo(() => {
    return Object.keys(imagesByDate);
  }, [imagesByDate]);

  const filteredImages = useMemo(() => {
    if (selectedDate === 'all') {
      return Object.values(imagesByDate).flat();
    }
    return imagesByDate[selectedDate] || [];
  }, [imagesByDate, selectedDate]);

  useEffect(() => {
    if (zoomedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && zoomedImageIndex > 0) {
        setZoomedImageIndex(zoomedImageIndex - 1);
      } else if (e.key === 'ArrowRight' && zoomedImageIndex < filteredImages.length - 1) {
        setZoomedImageIndex(zoomedImageIndex + 1);
      } else if (e.key === 'Escape') {
        setZoomedImageIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedImageIndex, filteredImages.length]);

  const handleTranslate = async () => {
    if (!data?.description) return;

    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=${targetLang}`;

      const formData = new URLSearchParams();
      formData.append('q', data.description);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const result = await response.json();

      const translatedText = result[0].map((segment: any) => segment[0]).join('');

      setTranslatedDescription(translatedText);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error translating!',
        description: 'There was an error trying to translate the text...',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          className="flex flex-col justify-between overflow-y-auto sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <SheetHeader className="gap-4">
            <div>
              <SheetTitle>{data?.title || 'Info'}</SheetTitle>
              {data?.description && (
                <SheetDescription className="mt-2 text-sm leading-relaxed">
                  {translatedDescription || data.description}
                </SheetDescription>
              )}
            </div>

            {data?.description && (
              <div className="flex items-center gap-2">
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value} className="text-xs">
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 px-3 text-xs gap-2"
                  onClick={handleTranslate}
                  disabled={isTranslating || !data?.description}
                >
                  {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                  {translatedDescription ? 'Refresh' : 'Translate'}
                </Button>
              </div>
            )}
          </SheetHeader>

          <div className="flex-1 flex flex-col gap-6 py-6">
            {data?.fields?.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label className="capitalize text-muted-foreground">{field.label}</Label>
                {typeof field.value === 'string' ? (
                  <p className="text-sm font-medium leading-none">{field.value}</p>
                ) : (
                  field.value
                )}
              </div>
            ))}

            {data?.raw &&
              Object.entries(data.raw)
                .filter(([k]) => !['name', 'description', 'label'].includes(k))
                .map(([key, value]) => {
                  if (key === 'images') {
                    if (!Array.isArray(value) || value.length === 0) return null;

                    const imageItems = value.map((mediaObj: any) => ({
                      id: mediaObj.id,
                      mimeType: mediaObj.mimeType,
                      createdAt: mediaObj.createdAt,
                    }));

                    return (
                      <div key={key} className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <Label className="capitalize">{key}</Label>
                          {availableDates.length > 1 && (
                            <Select value={selectedDate} onValueChange={setSelectedDate}>
                              <SelectTrigger className="w-[150px] h-8 text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                <SelectValue placeholder="Filter by date" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All dates</SelectItem>
                                {availableDates.map((date) => (
                                  <SelectItem key={date} value={date} className="text-xs">
                                    {date === 'Unknown' ? 'Unknown date' : date}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">TIP: hold shift to scroll horizontal</p>
                        <div className="flex gap-3 overflow-x-auto pb-2 snap-x custom-scrollbar">
                          {filteredImages.map((mediaObj, idx) => (
                            <button
                              key={mediaObj.id}
                              type="button"
                              onClick={() => setZoomedImageIndex(idx)}
                              className="relative flex-shrink-0 w-24 h-24 rounded-md border overflow-hidden snap-start hover:opacity-80 transition-opacity ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <img
                                src={`/api/images/${mediaObj.id}`}
                                alt="Token asset thumbnail"
                                className="object-cover w-full h-full"
                              />
                            </button>
                          ))}
                        </div>
                        {selectedDate !== 'all' && filteredImages.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Showing {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} from{' '}
                            {selectedDate === 'Unknown' ? 'unknown date' : selectedDate}
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (typeof value === 'object') {
                    return null;
                  }

                  return (
                    <div key={key} className="flex flex-col gap-1.5">
                      <Label className="capitalize text-muted-foreground">{key}</Label>
                      <p className="text-sm font-medium leading-none">{value}</p>
                    </div>
                  );
                })}
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={zoomedImageIndex !== null} onOpenChange={(open) => !open && setZoomedImageIndex(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent shadow-none p-0">
          <VisuallyHidden.Root>
            <DialogTitle>Image Preview</DialogTitle>
          </VisuallyHidden.Root>

          {zoomedImageIndex !== null && filteredImages[zoomedImageIndex] && (
            <div className="relative flex items-center justify-center flex-col gap-2">
              {zoomedImageIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 z-20 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomedImageIndex(zoomedImageIndex - 1);
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              <div className="relative">
                <img
                  src={`/api/images/${filteredImages[zoomedImageIndex].id}`}
                  alt="Enlarged token asset"
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
                {filteredImages.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-sm bg-black/50 text-white text-xs">
                    {zoomedImageIndex + 1} / {filteredImages.length}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-2 right-2 z-20 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const imageUrl = `${window.location.origin}/api/images/${filteredImages[zoomedImageIndex].id}`;
                    try {
                      await navigator.clipboard.writeText(imageUrl);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                      toast({
                        title: 'Copied!',
                        description: 'Image URL copied to clipboard',
                      });
                    } catch {
                      toast({
                        variant: 'destructive',
                        title: 'Failed to copy',
                        description: 'Could not copy URL to clipboard',
                      });
                    }
                  }}
                >
                  <Copy className={`h-4 w-4 ${copySuccess ? 'text-green-400' : ''}`} />
                </Button>
              </div>

              <div className=" -bottom-20 slide-out-to-left-1/2 bg-slate-800 bg-opacity-50 p-4 rounded-sm ">
                {(filteredImages[zoomedImageIndex] as any).description}
              </div>

              {zoomedImageIndex < filteredImages.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 z-20 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomedImageIndex(zoomedImageIndex + 1);
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Backwards compatible wrapper
interface LegacyFeatureInfoSheetProps {
  data: Record<string, string> | null;
  settlements: ISettlement[];
  setInspectData: Dispatch<SetStateAction<Record<string, string> | null>>;
}

export function FeatureInfoSheet({ data, setInspectData, settlements }: LegacyFeatureInfoSheetProps) {
  const infoSheetData: InfoSheetData | null = useMemo(() => {
    if (!data) return null;

    return {
      title: data.name || data.label || 'Token Info',
      description: data.description,
      raw: {
        ...data,
        ...(data['settlement'] && {
          settlement: settlements.find((s) => s.id === data['settlement'])?.name || '',
        }),
      },
    };
  }, [data]);

  return <InfoSheet data={infoSheetData} open={!!data} onOpenChange={(open) => !open && setInspectData(null)} />;
}
