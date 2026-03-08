import { updateMapCustomFeature } from '@/server/actions/map/map.actions';
import Feature, { FeatureLike } from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { Type } from 'ol/geom/Geometry';
import { fromCircle } from 'ol/geom/Polygon';
import { ModifyEvent } from 'ol/interaction/Modify';
import { TranslateEvent } from 'ol/interaction/Translate';
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

  return { geometryJson, propertiesJson };
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
