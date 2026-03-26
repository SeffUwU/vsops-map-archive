import { mapIcons } from '@/constants/map.consts';
import { VSMap } from '@/types/map/vsmap';
import { FeatureLike } from 'ol/Feature';
import Map from 'ol/Map';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { getVisitedFeatures } from './map.utils';

/**
 * Handles styling for custom features layer. This mainly is for reduction of ize
 * @param map
 * @returns
 */
export const handleCustomFeatureLayerStyle =
  (map: Map | null, layersStateRef: VSMap.TogglesState) => (feature: FeatureLike) => {
    if (!map) return;

    const geometryType = feature.getGeometry()!.getType();
    const zoom = map.getView().getZoom() || 1;
    const properties = feature.getProperties() as VSMap.FeatureProperties;
    const visitedFeature = getVisitedFeatures()?.find((f) => f.id === feature.getId());
    const updatedSinceLastVisit = visitedFeature
      ? new Date(visitedFeature.visitedAt) <= new Date(properties.updatedAt)
      : false;

    const title = `${updatedSinceLastVisit ? '⭐ ' : ''}${feature.get('name') || ''}${properties?.images?.length ? ' 🖼️' : ''}`;

    switch (geometryType) {
      case 'LineString':
      case 'MultiLineString':
        if (feature.get('shapeType') === 'road') {
          return new Style({
            fill: new Fill({
              color: 'rgba(255, 165, 0, 0.3)',
            }),
            stroke: new Stroke({
              color: '#',
              width: 2,
            }),

            // TODO: texture?
            // renderer(pixelCoordinates, state) {
            //   const { context } = state;

            //   context.lineCap = 'round';
            //   context.lineJoin = 'round';

            //   const patte964B00rn = context.createPattern(roadImage, 'repeat');
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
              text: title,
              font: '12px Arial',
              fill: new Fill({ color: '#000' }),
              stroke: new Stroke({ color: '#fff', width: 2 }),
              backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.3)' }),
              padding: [2, 2, 2, 2],
              offsetY: -16,
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
            text: title,
            font: '12px Arial',
            backgroundFill: new Fill({ color: 'rgba(0, 0, 0, 0.3)' }),
            padding: [2, 2, 2, 2],
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
