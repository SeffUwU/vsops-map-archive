import { updateMapCustomFeature } from '@/server/actions/map/map.actions';
import { VSMap } from '@/types/map/vsmap';
import Feature, { FeatureLike } from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { Type } from 'ol/geom/Geometry';
import { fromCircle } from 'ol/geom/Polygon';
import { ModifyEvent } from 'ol/interaction/Modify';
import { TranslateEvent } from 'ol/interaction/Translate';
import { fromLonLat } from 'ol/proj';
import { localStorageUtils } from '../local-storage/local-storage.utils';
import { LS_VisitedFeaturesKey } from '@/constants/map.consts';

const format = new GeoJSON();

export function transformAndPrepareFeatureForSave(newFeature: Feature, transformCircle: boolean) {
  let geometryClass = newFeature.getGeometry()!;
  const shapeType = newFeature.get('shapeType');

  if ((transformCircle && shapeType === 'circle') || geometryClass.getType() === 'Circle') {
    // TODO:32 geojson doesnt support circles :( transfrorm to polygon..
    geometryClass = fromCircle(geometryClass as any, 32);
  }

  const geometryJson = format.writeGeometryObject(geometryClass, {
    featureProjection: 'EPSG:3857', // What the map uses (meters)
    dataProjection: 'EPSG:4326', // What GeoJSON uses (lat/lon)
  });

  const { geometry, ...propertiesJson } = newFeature.getProperties();

  return { geometryJson, propertiesJson: propertiesJson as VSMap.FeatureProperties };
}

export async function saveModifyTranslateFeatures(event: ModifyEvent | TranslateEvent) {
  const features = event.features.getArray();

  const savePromises = features.map(async (feature) => {
    const featureId = feature.getId();

    if (!featureId) {
      console.warn('Feature missing ID, skipping save.');
      return;
    }

    const { geometryJson, propertiesJson } = transformAndPrepareFeatureForSave(feature, false);

    return updateMapCustomFeature(featureId as string, geometryJson, propertiesJson);
  });

  return await Promise.all(savePromises);
}

export function isStandartFeatureSet(feature: FeatureLike, type?: Type) {
  const featureProps = feature.getProperties();
  return featureProps.type === 'Base' || 'wares' in featureProps || type === 'MultiLineString' || !!featureProps?.tag;
}

export const getFeatureCenter = (feature: any): [number, number] => {
  const { type, coordinates } = feature.geometry;

  let center: [number, number] = [0, 0];

  if (type === 'Point') {
    center = [coordinates[0], coordinates[1]];
  } else if (type === 'Polygon' || type === 'Feature') {
    const points = coordinates[0];
    const lng = points.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / points.length;
    const lat = points.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / points.length;
    center = [lng, lat];
  }

  if (Math.abs(center[0]) <= 180 && Math.abs(center[1]) <= 90) {
    return fromLonLat(center) as [number, number];
  }

  return center;
};

export const getVisitedFeatures = (): VSMap.VisitedFeature[] => {
  type JSONedVisitedFeature = Omit<VSMap.VisitedFeature, 'visitedAt'> & { visitedAt: string };

  return localStorageUtils
    .getArrayFrom<JSONedVisitedFeature[]>(LS_VisitedFeaturesKey)
    .map((v) => ({ ...v, visitedAt: new Date(v.visitedAt) }));
};

export const pushVisitedFeature = (id: string): void => {
  localStorageUtils.pushToArray<VSMap.VisitedFeature>(LS_VisitedFeaturesKey, { id, visitedAt: new Date() });
};
