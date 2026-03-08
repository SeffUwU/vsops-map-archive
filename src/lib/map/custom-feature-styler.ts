import { FeatureLike } from 'ol/Feature';
import Map from 'ol/Map';
import { Fill, Stroke, Style, Text } from 'ol/style';

/**
 * Handles styling for custom features layer. This mainly is for reduction of ize
 * @param map
 * @returns
 */
export const handleCustomFeatureLayerStyle = (map: Map | null) => (feature: FeatureLike) => {
  if (!map) return;

  const geometryType = feature.getGeometry()!.getType();
  const zoom = map.getView().getZoom() || 1;

  switch (geometryType) {
    case 'LineString':
    case 'MultiLineString':
      if (feature.get('shapeType') === 'road') {
        return new Style({
          fill: new Fill({
            color: 'rgba(255, 165, 0, 0.3)',
          }),
          stroke: new Stroke({
            color: '#964B00',
            width: 2,
          }),

          // TODO: texture?
          // renderer(pixelCoordinates, state) {
          //   const { context } = state;

          //   context.lineCap = 'round';
          //   context.lineJoin = 'round';

          //   const pattern = context.createPattern(roadImage, 'repeat');
          //   context.strokeStyle = pattern!;

          //   context.lineWidth = 20 * (zoom / 11);

          //   context.beginPath();

          //   pixelCoordinates.forEach((line) => {
          //     typeof line !== 'number' &&
          //       line.forEach((coord: any, i) => {
          //         if (i === 0) context.moveTo(coord[0], coord[1]);
          //         else context.lineTo(coord[0], coord[1]);
          //       });
          //   });

          //   context.stroke();
          // },
        });
      }
    case 'Circle':
    case 'Polygon': {
      if (feature.get('shapeType') === 'circle') {
        return new Style({
          fill: new Fill({
            color: 'rgba(0, 191, 255, 0.3)', // Deep sky blue with transparency
          }),
          stroke: new Stroke({
            color: '#00BFFF',
            width: 2,
          }),
          text: new Text({
            text: feature.get('name') || '',
            font: '12px Arial',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
            offsetY: -15,
          }),
        });
      }

      return new Style({
        fill: new Fill({
          color: 'rgba(255, 165, 0, 0.3)',
        }),
        stroke: new Stroke({
          color: '#FF8C00',
          width: 2,
        }),
        text: new Text({
          text: feature.get('name') || '',
          font: '12px Arial',
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
          offsetY: -15,
        }),
      });
    }

    default:
      return new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.3)',
        }),
        stroke: new Stroke({
          color: '#FFFFFF',
          width: 2,
        }),
      });
  }
};
