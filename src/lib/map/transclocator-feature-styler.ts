import { mapColorRef, mapIcons } from '@/constants/map.consts';
import { VSMap } from '@/types/map/vsmap';
import { FeatureLike } from 'ol/Feature';
import { MultiPoint } from 'ol/geom';
import { Icon, Stroke, Style } from 'ol/style';
import React from 'react';

export const handleCustomTranslocatorStyle = (layersStateRef: React.MutableRefObject<VSMap.TogglesState>) => (feature: FeatureLike) => {
  let opacity = 1;
  let isOn = layersStateRef.current.translocators;
  let tlCol = mapColorRef['Translocators']['Translocator'];

  if (feature.get('tag') == 'SPAWN') {
    tlCol = mapColorRef['Translocators']['Spawn Translocator'];
  } else if (feature.get('tag') == 'TP') {
    tlCol = mapColorRef['Translocators']['Teleporter'];
  } else if (feature.get('label') != undefined && feature.get('label').length > 0) {
    tlCol = mapColorRef['Translocators']['Named Translocator'];
  }
  if (!isOn) {
    opacity = 0;
  }
  return [
    new Style({
      stroke: new Stroke({
        color: tlCol.concat(opacity),
        width: 2,
      }),
    }),
    new Style({
      image: new Icon({
        color: tlCol,
        opacity: opacity,
        src: mapIcons['Translocators'],
      }),
      geometry: function (feature) {
        let coordinates = (feature.getGeometry()! as any).getCoordinates();
        return new MultiPoint(coordinates);
      },
    }),
  ];
};
