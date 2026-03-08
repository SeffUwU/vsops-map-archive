import { mapIcons, mapColorRef } from '@/constants/map.consts';
import { MultiPoint } from 'ol/geom';
import { Style, Stroke, Icon } from 'ol/style';

// copied from web cartographer thi is monstocity of any :D
export const highlightStyleTranslocator = [
  new Style({
    stroke: new Stroke({
      color: '#ddaaff',
      width: 3,
    }),
  }),
  new Style({
    image: new Icon({
      color: [255, 192, 255],
      opacity: 1,
      src: mapIcons['Translocators'],
    }),
    geometry: function (feature) {
      let coordinates = (feature.getGeometry() as any).getCoordinates();
      return new MultiPoint(coordinates);
    },
  }),
];

export const highlightStyleTrader = function (feature: any) {
  return new Style({
    image: new Icon({
      color: ((mapColorRef['Traders'] as any)[feature.get('wares') as any] as any).map((val: number, i: any) =>
        Math.min(Math.max(val * 1.5, 64), 255),
      ),
      src: mapIcons['Traders'],
    }),
  });
};
