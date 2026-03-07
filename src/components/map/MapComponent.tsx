'use client';

import { mapColorRef, mapIcons, mapMousePosController, vintageStoryWorldGrid } from '@/constants/map.consts';
import { handleCustomFeatureLayerStyle } from '@/lib/map/custom-feature-styler';
import { handleCustomTranslocatorStyle } from '@/lib/map/transclocator-feature-styler';
import { getFeatureDialogConfig } from '@/types/map/dialog.configs';
import ContextMenu, { Item } from 'ol-contextmenu';
import Transform from 'ol-ext/interaction/Transform';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import Collection from 'ol/Collection';
import { MultiPoint } from 'ol/geom';
import { Draw, Modify, Translate } from 'ol/interaction';
import { createBox, DrawEvent } from 'ol/interaction/Draw';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import 'ol/ol.css';
import { Vector } from 'ol/source';
import XYZ from 'ol/source/XYZ';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { useEffect, useRef, useState } from 'react';
import { useGlobalContext, useTranslation } from '../contexts/global.client.context';
import { Button } from '../ui/button';
import { FeatureInfoSheet } from './FeatureInfoSheet';
import { FeaturePromptDialog } from './FeaturePromptDialog';
import { VSMap } from '@/types/map/vsmap';

export function MapComponent() {
  const t = useTranslation();
  const featureBuilderDialog = useRef(getFeatureDialogConfig(t));

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const {
    map: { layersRef, mapRef, layersStateRef },
  } = useGlobalContext();
  const [inspectData, setInspectData] = useState<Record<string, string> | null>(null);
  const [drawMode, setDrawMode] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<VSMap.CustomFeatureType | null>(null);
  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    resolve: (val: any) => void;
    config: DialogBuilder.FieldBuilderConfig;
  } | null>(null);
  const modifyInteractionRef = useRef<any>(null);
  const translateInteractionRef = useRef<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  function asyncPrompt<T extends DialogBuilder.FieldBuilderConfig>(fieldConfig: T): Promise<DialogBuilder.Result<T>> {
    return new Promise((resolve) => {
      setPromptConfig({ isOpen: true, resolve, config: fieldConfig });
    });
  }

  const drawInteractionRef = useRef<any>(null);

  const cancelDrawing = () => {
    if (drawInteractionRef.current) {
      mapRef.current?.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    toggleEditMode();
    setDrawMode(null);
    setSelectedShape(null);
  };

  const startCustomDraw = (shapeType: VSMap.CustomFeatureType) => {
    if (!mapRef.current || !layersRef.current?.custom) return;
    const map = mapRef.current;

    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
    }

    let draw;
    const source = layersRef.current.custom.getSource();

    switch (shapeType) {
      case 'square':
        draw = new Draw({
          source: source!,
          type: 'Circle',
          geometryFunction: createBox(),
          style: new Style({
            stroke: new Stroke({
              color: '#00FF00',
              width: 2,
              lineDash: [10, 10],
            }),
            fill: new Fill({
              color: 'rgba(0, 255, 0, 0.1)',
            }),
          }),
        });
        // // Clean up preview layer when done
        // draw.on('drawend', () => {
        //   map.removeLayer(previewLayer);
        // });

        // draw.on('drawabort', () => {
        //   map.removeLayer(previewLayer);
        // });
        break;

      case 'circle':
        draw = new Draw({
          source: source!,
          type: 'Circle',
        });
        break;

      case 'polygon':
        draw = new Draw({
          source: source!,
          type: 'Polygon',
        });
        break;
      case 'road':
        draw = new Draw({
          source: source!,
          type: 'MultiLineString',
        });
        break;
    }

    draw.on('drawend', async (event: DrawEvent) => {
      const newFeature = event.feature;
      map.removeInteraction(draw);
      drawInteractionRef.current = null;

      const result = await asyncPrompt(featureBuilderDialog.current);

      if (!result.cancelled) {
        Object.entries(result.data).forEach(([key, value]) => {
          newFeature.set(key as keyof typeof result.data, value);
        });
        newFeature.set('shapeType', shapeType);
      } else {
        source?.removeFeature(newFeature);
      }

      setDrawMode(null);
      setSelectedShape(null);
    });

    map.addInteraction(draw);
    drawInteractionRef.current = draw;
    setDrawMode('drawing');
    setSelectedShape(shapeType);
  };

  const toggleEditMode = (feature?: Feature) => {
    const map = mapRef.current;
    if (!map) return;

    if (modifyInteractionRef.current) map.removeInteraction(modifyInteractionRef.current);
    if (translateInteractionRef.current) map.removeInteraction(translateInteractionRef.current);

    if (!isEditing && feature) {
      const isSquare = feature.get('shapeType') === 'square';

      if (isSquare) {
        // only use ol-ext for squares
        const transform = new Transform({
          features: [feature],
          translate: true,
          stretch: false,
          scale: true,
          rotate: true,
          hitTolerance: 10,
        });
        map.addInteraction(transform);
        modifyInteractionRef.current = transform;
      } else {
        const collection = new Collection([feature]);

        const translate = new Translate({ features: collection });
        const modify = new Modify({ features: collection });

        map.addInteraction(translate);
        map.addInteraction(modify);

        modifyInteractionRef.current = modify;
        translateInteractionRef.current = translate;
      }

      setIsEditing(true);
      setDrawMode('editing');
    } else {
      setIsEditing(false);
      setDrawMode(null);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const wsWorld = new TileLayer({
      source: new XYZ({
        interpolate: false,
        wrapX: false,
        tileGrid: vintageStoryWorldGrid,
        url: 'https://map.tops.vintagestory.at/data/world/{z}/{x}_{y}.png',
      }),
    });

    let highlightStyleTranslocator = [
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
        geometry: (feature: any) => {
          if (feature) {
            let coordinates = feature.getGeometry().getCoordinates();
            return new MultiPoint(coordinates);
          }
        },
      }),
    ];
    const customVectorSource = new Vector({
      url: 'buildings.geojson',
      format: new GeoJSON(),
    });
    // TODO: do this for other types too!
    const roadImage = new Image();
    roadImage.src = '/mud_road.png';

    const miscStyleCache: Record<string, Style> = {};
    const baseIconCache: Record<string, Icon> = {};
    const sharedTextFill = new Fill({ color: [0, 0, 0] });
    const sharedTextStroke = new Stroke({ color: [255, 255, 255], width: 3 });

    layersRef.current = {
      landmarks: new VectorLayer({
        // name: "Landmarks",
        minZoom: 2, // TODO: fix
        source: new Vector({
          url: `/landmarks.geojson`,
          format: new GeoJSON(),
        }),
        style: (feature) => {
          const type = feature.get('type') as string;

          if (type == 'Misc') {
            if (!miscStyleCache[type]) {
              miscStyleCache[type] = new Style({
                image: new Icon({
                  opacity: 1,
                  // TODO: monstrocity
                  src: (mapIcons['Landmarks'] as any)[type] as any,
                }),
              });
            }

            return miscStyleCache[type];
          } // TODO : find a way to return nothing instead of an invisible icon, it would probably be more efficient
          else if (type == 'Base') {
            const isOn = layersStateRef.current.landmarks;
            let image = null;
            let text = null;

            if (isOn) {
              if (!baseIconCache[type]) {
                baseIconCache[type] = new Icon({
                  color: (mapColorRef['Landmarks'] as any)[type],
                  src: (mapIcons['Landmarks'] as any)[type],
                });
              }
              image = baseIconCache[type];

              text = new Text({
                font: 'bold ' + String(localStorage.labelSize || 12) + 'px "arial narrow", "sans serif"',
                text: feature.get('label'),
                textAlign: 'left',
                textBaseline: 'bottom',
                offsetX: 10,
                fill: sharedTextFill,
                stroke: sharedTextStroke,
              });
            } else {
              // TODO: hacky.. works?
              return null as any;
            }

            // TODO: no clue what this is??
            // return new Style({
            //   zIndex: type == 'Server' ? 1000 : undefined,
            //   image: image,
            //   text: text,
            // });
          }

          return null;
        },
      }),
      traders: new VectorLayer({
        // name: "Traders",
        minZoom: 3,
        source: new Vector({
          url: 'traders.geojson',
          format: new GeoJSON(),
        }),
        style: function (feature) {
          let isOn = layersStateRef.current.traders;

          return new Style({
            image: new Icon({
              color: (mapColorRef['Traders'] as any)[feature.get('wares')],
              opacity: isOn ? 1 : 0,
              src: mapIcons['Traders'],
            }),
          });
        },
      }),
      translocators: new VectorLayer({
        // name: "Translocators",
        minZoom: 2,
        source: new Vector({
          url: 'translocators.geojson',
          format: new GeoJSON(),
        }),
        style: handleCustomTranslocatorStyle(layersStateRef.current),
      }),
      chunks: new VectorLayer({
        className: 'vsGenChunks',
        // name: "Explored Chunks",
        source: new Vector({
          url: 'chunk.geojson',
          format: new GeoJSON(),
        }),
        opacity: 0.5,
        style: function (feature) {
          return new Style({
            fill: new Fill({ color: feature.get('color') }),
            stroke: new Stroke({ color: '#000000', width: 1 }),
          });
        },
      }),
      custom: new VectorLayer({
        className: 'vsBuildings',
        source: customVectorSource,
        style: handleCustomFeatureLayerStyle(mapRef.current),
      }),
    };

    const view = new View({
      center: [-2500, 0],
      zoom: 4,
      resolutions: [256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125],
      constrainResolution: true,
    });

    const map = new Map({
      target: mapContainerRef.current,
      controls: [mapMousePosController],
      layers: [
        wsWorld,
        layersRef.current.chunks,
        layersRef.current.traders,
        layersRef.current.translocators,
        layersRef.current.landmarks,
        layersRef.current.custom,
      ],
      view,
    });

    map.on('moveend', (_event) => {
      const center = map.getView().getCenter();
      if (center) {
        const newHref =
          window.location.pathname +
          '?x=' +
          Math.round(center[0]) +
          '&y=' +
          Math.round(center[1]) +
          '&zoom=' +
          map.getView().getZoom();

        window.history.pushState({}, '', newHref);
      }
    });

    const menuItems: Item[] = [
      {
        text: 'Center map here',
        callback: (obj, map) => {
          map.getView().setCenter(obj.coordinate);
        },
      },
      {
        text: 'Go To',
        callback: (_obj, map) => {
          const matches = prompt('Coordinates comma or space separated')?.match(/(-?\d+)\s*[,\s]\s*(-?\d+)/);
          if (!matches) {
            return alert('invalid coordinate format');
          }

          map.getView().animate({
            center: [parseInt(matches[0]), parseInt(matches[1])],
            duration: 700,
          });
        },
      },
      {
        text: 'Inspect',
        callback: (obj, map) => {
          const pixel = map.getPixelFromCoordinate(obj.coordinate);

          const feature = map.forEachFeatureAtPixel(pixel, (feat) => feat);

          if (feature) {
            const { geometry, z, ...rest } = feature.getProperties();
            setInspectData(rest);
          }
        },
      },
      '-',
      {
        text: 'Create',
        items: [
          {
            text: 'Circle',
            callback: () => startCustomDraw('circle'),
          },
          {
            text: 'Square',
            callback: () => startCustomDraw('square'),
          },
          {
            text: 'Polygon',
            callback: () => startCustomDraw('polygon'),
          },
          {
            text: 'Road',
            callback: () => startCustomDraw('road'),
          },
        ],
      },
      '-',
    ];

    const contextmenu = new ContextMenu({
      width: 170,
      defaultItems: false,
      items: menuItems,
    });

    contextmenu.on('beforeopen', (evt) => {
      const currentFeature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);
      contextmenu.clear();
      contextmenu.extend(menuItems);
      if (!currentFeature) return;

      const type = currentFeature.getGeometry()?.getType();
      const featureProps = currentFeature.getProperties();
      const isStandardFeatureSet =
        featureProps.type === 'Base' || 'wares' in featureProps || type === 'MultiLineString' || !!featureProps?.tag;

      if (isStandardFeatureSet) return;
      if (currentFeature && currentFeature.getGeometry()?.getType()) {
        console.log('[FEATURE PROPS]', currentFeature.getProperties());

        contextmenu.extend([
          {
            text: 'Edit Shape',
            callback: () => toggleEditMode(currentFeature as Feature),
          },
          {
            text: 'Delete Feature',
            callback: () => customVectorSource.removeFeature(currentFeature as Feature),
          },
        ]);
      }
    });

    map.addControl(contextmenu);
    mapRef.current = map;

    return () => {
      map.getInteractions().clear();
      map.getControls().clear();
      map.getLayers().clear();
      map.setTarget(undefined);
    };
  }, []);

  // TODO: hacky for map size kek
  const mainContainer = typeof document !== 'undefined' ? document.querySelector('main') : null;

  return (
    <>
      {drawMode && (
        <div id="mouse-position-out" className="absolute top-4 left-20 bg-white z-30 p-4 rounded-md shadow-sm">
          <Button onClick={cancelDrawing}>Cancel</Button>
        </div>
      )}
      <FeatureInfoSheet data={inspectData} setInspectData={setInspectData} />
      {promptConfig && (
        <FeaturePromptDialog
          isOpen={promptConfig.isOpen}
          onClose={(val) => {
            promptConfig.resolve(val);
            setPromptConfig(null);
          }}
          config={promptConfig.config}
        />
      )}
      <div
        ref={mapContainerRef}
        className="w-full h-full flex items-center justify-center"
        style={{
          height: mainContainer?.clientHeight,
          width: mainContainer?.clientWidth,
          backgroundColor: '#000',
        }}
      />
    </>
  );
}
