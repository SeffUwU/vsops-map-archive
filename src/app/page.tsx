import { MapComponent } from '@/components/map/MapComponent';

export default function Home() {
  return (
    <div>
      <div id="mouse-position-out" className="coords" />
      <MapComponent />
    </div>
  );
}
