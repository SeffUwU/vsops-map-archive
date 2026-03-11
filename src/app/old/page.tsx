import { MapComponent } from '@/components/map/MapComponent';

export type HomeParams = {
  x?: string;
  y?: string;
  zoom?: string;
  coords?: string;
};

export default async function Home({ searchParams }: { searchParams: HomeParams }) {
  return (
    <div>
      <MapComponent old={true} />
    </div>
  );
}
