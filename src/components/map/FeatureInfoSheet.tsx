import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Dispatch, SetStateAction, useState } from 'react';

interface FeatureInfoSheetProps {
  data: Record<string, string> | null;
  setInspectData: Dispatch<SetStateAction<Record<string, string> | null>>;
}
export function FeatureInfoSheet({ data, setInspectData }: FeatureInfoSheetProps) {
  // State to track which token image is currently being viewed in full size
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <>
      <Sheet
        open={!!data}
        onOpenChange={(open) => {
          if (!open) {
            setInspectData(null);
          }
        }}
        modal={false}
      >
        <SheetContent
          className="flex flex-col justify-between overflow-y-auto sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <SheetTitle>{data?.name || data?.label || 'Token Info'}</SheetTitle>
            <SheetDescription>{data?.description}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 flex flex-col gap-6 py-6">
            {data &&
              Object.entries(data)
                .filter(([k]) => !['name', 'description', 'label'].includes(k))
                .map(([key, value]) => {
                  if (key === 'images') {
                    const imageIds = Array.isArray(value)
                      ? value
                      : typeof value === 'string'
                        ? value.split(',').filter(Boolean)
                        : [];

                    if (imageIds.length === 0) return null;

                    return (
                      <div key={key} className="flex flex-col gap-3">
                        <Label className="capitalize">{key}</Label>
                        <div className="flex gap-3 overflow-x-auto pb-2 snap-x custom-scrollbar">
                          {imageIds.map((id) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setZoomedImage(id)}
                              className="relative flex-shrink-0 w-24 h-24 rounded-md border overflow-hidden snap-start hover:opacity-80 transition-opacity ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <img
                                src={`/api/images/${id}`}
                                alt="Token asset thumbnail"
                                className="object-cover w-full h-full"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // ...rest are plain text
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

      <Dialog open={!!zoomedImage} onOpenChange={(open) => !open && setZoomedImage(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent shadow-none flex justify-center p-0">
          <VisuallyHidden.Root>
            <DialogTitle>{zoomedImage}</DialogTitle>
          </VisuallyHidden.Root>

          {zoomedImage && (
            <img
              src={`/api/images/${zoomedImage}`}
              alt="Enlarged token asset"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
