'use client';

import Map from 'ol/Map';
import View from 'ol/View';
import { MousePosition } from 'ol/control';
import { toStringXY } from 'ol/coordinate';
import TileLayer from 'ol/layer/Tile';
import 'ol/ol.css';
import XYZ from 'ol/source/XYZ';
import { TileGrid } from 'ol/tilegrid';
import { useEffect, useRef, useState } from 'react';

import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
import { MultiPoint, Polygon } from 'ol/geom';
import { Vector } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { config } from '@/constants/config';
import { VSMap } from '@/types/map/vsmap';
import { useGlobalContext } from '../contexts/global.client.context';
import { Draw } from 'ol/interaction';
import Feature from 'ol/Feature';
import { createBox, DrawEvent } from 'ol/interaction/Draw';
import ContextMenu from 'ol-contextmenu';
import { Button } from '../ui/button';

const X_OFFSET = 162282;
const Y_OFFSET = 211883 - 235246 - 188522;

const vsWorldGrid = new TileGrid({
  extent: [-512000, -512000, 512000, 512000],
  origin: [-512000 + X_OFFSET, 512000 + Y_OFFSET],
  resolutions: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
  tileSize: [256, 256],
});

const mousePos = new MousePosition({
  coordinateFormat: function (coordinate) {
    return toStringXY([coordinate![0], -coordinate![1]], 0);
  },
  className: 'coords',
  target: 'mouse-position-out',
});

export function MapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const {
    map: { layersRef, mapRef, layersStateRef },
  } = useGlobalContext();

  const [drawMode, setDrawMode] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<'square' | 'circle' | 'polygon' | null>(null);

  // Add drawing interaction ref
  const drawInteractionRef = useRef<any>(null);

  // Function to cancel drawing
  const cancelDrawing = () => {
    if (drawInteractionRef.current) {
      mapRef.current?.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    setDrawMode(null);
    setSelectedShape(null);
  };

  const startBuildingDraw = (shapeType: 'square' | 'circle' | 'polygon') => {
    if (!mapRef.current || !layersRef.current?.buildings) return;
    const map = mapRef.current;

    // Remove existing draw interaction
    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
    }

    let draw;
    const source = layersRef.current.buildings.getSource();

    switch (shapeType) {
      case 'square':
        // Create a temporary layer for preview
        const previewSource = new Vector();
        const previewLayer = new VectorLayer({
          source: previewSource,
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

        // Add preview layer to map
        map.addLayer(previewLayer);

        draw = new Draw({
          source: source!,
          type: 'Circle',
          geometryFunction: createBox(),
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
    }

    draw.on('drawend', (event: DrawEvent) => {
      const newFeature = event.feature;

      const name = prompt('Enter building name:', 'Building');

      if (name) {
        newFeature.set('name', name);
        newFeature.set('type', 'building');
        newFeature.set('shapeType', shapeType);
      }

      setDrawMode(null);
      setSelectedShape(null);
      map.removeInteraction(draw);
      drawInteractionRef.current = null;
    });

    map.addInteraction(draw);
    drawInteractionRef.current = draw;
    setDrawMode('drawing');
    setSelectedShape(shapeType);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const wsWorld = new TileLayer({
      source: new XYZ({
        interpolate: false,
        wrapX: false,
        tileGrid: vsWorldGrid,
        url: 'https://map.tops.vintagestory.at/data/world/{z}/{x}_{y}.png',
      }),
    });

    let colorsRef = {
      Traders: {
        'Artisan trader': [0, 240, 240],
        'Building materials trader': [255, 0, 0],
        'Clothing trader': [0, 128, 0],
        'Commodities trader': [128, 128, 128],
        'Agriculture trader': [200, 192, 128],
        'Furniture trader': [255, 128, 0],
        'Luxuries trader': [0, 0, 255],
        'Survival goods trader': [255, 255, 0],
        'Treasure hunter trader': [160, 0, 160],
        unknown: [48, 48, 48],
      },
      Translocators: {
        Translocator: [192, 0, 192],
        'Named Translocator': [71, 45, 255],
        'Spawn Translocator': [0, 192, 192],
        Teleporter: [229, 57, 53],
      },
      Landmarks: {
        Server: undefined, // This one uses a PNG, we don't want to color it
        Base: [192, 192, 192],
        Misc: [224, 224, 224],
      },
    };

    let icons = {
      Traders: `${config.vsmBaseUrl}/assets/icons/waypoints/trader.svg`,
      Translocators: `${config.vsmBaseUrl}/assets/icons/waypoints/spiral.svg`,
      Landmarks: {
        Base: `${config.vsmBaseUrl}/assets/icons/waypoints/home.svg`,
        Misc: `${config.vsmBaseUrl}/assets/icons/waypoints/star1.svg`,
        Server: `${config.vsmBaseUrl}/assets/icons/temporal_gear.png`,
      },
      'Explored Chunks': `${config.vsmBaseUrl}/assets/icons/default/square.png`,
    };

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
          src: icons['Translocators'],
        }),
        geometry: (feature: any) => {
          if (feature) {
            let coordinates = feature.getGeometry().getCoordinates();
            return new MultiPoint(coordinates);
          }
        },
      }),
    ];
    const buildingVectorSource = new Vector({
      url: 'buildings.geojson', // Optional: if you have existing building data
      format: new GeoJSON(),
    });

    layersRef.current = {
      landmarks: new VectorLayer({
        // name: "Landmarks",
        minZoom: 2, // TODO: fix
        source: new Vector({
          url: `/landmarks.geojson`,
          format: new GeoJSON(),
        }),
        style: (feature) => {
          if (feature.get('type') == 'Misc') {
            return new Style({
              image: new Icon({
                opacity: 1,
                // TODO: monstrocity
                src: (icons['Landmarks'] as any)[feature.get('type') as any] as any,
              }),
            });
          } // TODO : find a way to return nothing instead of an invisible icon, it would probably be more efficient
          else if (feature.get('type') == 'Base') {
            const isOn = layersStateRef.current.landmarks;
            let image = null;
            let text = null;

            if (isOn) {
              // TODO: do not instance this for each base, we can create a hashmap of colored ones :3
              image = new Icon({
                color: (colorsRef['Landmarks'] as any)[feature.get('type')],
                src: (icons['Landmarks'] as any)[feature.get('type')],
              });

              text = new Text({
                font: 'bold ' + String(localStorage.labelSize) + 'px "arial narrow", "sans serif"',
                text: feature.get('label'),
                textAlign: 'left',
                textBaseline: 'bottom',
                offsetX: 10,
                fill: new Fill({ color: [0, 0, 0] }),
                stroke: new Stroke({ color: [255, 255, 255], width: 3 }),
              });
            } else {
              // TODO: hacky.. works?
              return null as any;
            }

            return new Style({
              zIndex: feature.get('type') == 'Server' ? 1000 : undefined,
              image: image,
              text: text,
            });
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
              color: (colorsRef['Traders'] as any)[feature.get('wares')],
              opacity: isOn ? 1 : 0,
              src: icons['Traders'],
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
        style: function (feature) {
          let opacity = 1;
          let isOn = layersStateRef.current.translocators;
          let tlCol = colorsRef['Translocators']['Translocator'];

          if (feature.get('tag') == 'SPAWN') {
            tlCol = colorsRef['Translocators']['Spawn Translocator'];
            // isOn = (showSubLayerItems["Translocators"] as any)["Spawn Translocator"];
          } else if (feature.get('tag') == 'TP') {
            tlCol = colorsRef['Translocators']['Teleporter'];
            // isOn = (showSubLayerItems["Translocators"] as any)["Teleporter"];
          } else if (feature.get('label') != undefined && feature.get('label').length > 0) {
            tlCol = colorsRef['Translocators']['Named Translocator'];
            // isOn = (showSubLayerItems["Translocators"] as any)["Named Translocator"];
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
                src: icons['Translocators'],
              }),
              geometry: function (feature) {
                let coordinates = (feature.getGeometry()! as any).getCoordinates();
                return new MultiPoint(coordinates);
              },
            }),
          ];
        },
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
      buildings: new VectorLayer({
        className: 'vsBuildings',
        source: buildingVectorSource,
        style: (feature) => {
          const geometryType = feature.getGeometry()!.getType();

          // Different styles based on geometry type
          switch (geometryType) {
            case 'Polygon':
              return new Style({
                fill: new Fill({
                  color: 'rgba(255, 165, 0, 0.3)', // Orange with transparency
                }),
                stroke: new Stroke({
                  color: '#FF8C00', // Dark orange
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

            case 'Circle':
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
        },
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
      controls: [mousePos],
      layers: [
        wsWorld,
        layersRef.current.chunks,
        layersRef.current.traders,
        layersRef.current.translocators,
        layersRef.current.landmarks,
        layersRef.current.buildings,
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
    const contextmenu = new ContextMenu({
      width: 170,
      defaultItems: false,
      items: [
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
          text: 'Export',
          callback: () => {
            const format = new GeoJSON();
            const featues = buildingVectorSource.getFeatures();
            const str = format.writeFeatures(featues);
            console.log(str);
          },
        },
        '-',
        {
          text: 'Create',
          items: [
            {
              text: 'Circle',
              callback: () => startBuildingDraw('circle'),
            },
            {
              text: 'Square',
              callback: () => startBuildingDraw('square'),
            },
            {
              text: 'Polygon',
              callback: () => startBuildingDraw('polygon'),
            },
          ],
        },
      ],
    });

    contextmenu.on('beforeopen', (evt) => {
      const currentFeature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);
      if (!currentFeature) return;

      const type = currentFeature.getGeometry()?.getType();
      const featureProps = currentFeature.getProperties();
      const isStandardFeatureSet =
        featureProps.type === 'Base' || 'wares' in featureProps || type === 'LineString' || !!featureProps?.tag;

      if (isStandardFeatureSet) return;

      if (currentFeature && currentFeature.getGeometry()?.getType()) {
        console.log('[FEATURE PROPS]', currentFeature.getProperties());

        contextmenu.extend([
          {
            text: 'Delete Feature',
            callback: () => buildingVectorSource.removeFeature(currentFeature as Feature),
          },
          '-',
        ]);
      }
    });

    map.addControl(contextmenu);
    mapRef.current = map;

    return () => map.setTarget(undefined);
  }, []);

  // TODO: hacky for map size kek
  const mainContainer = document.querySelector('main');

  return (
    <>
      <div id="mouse-position-out" className="absolute top-4 left-20 bg-white z-30 p-4 rounded-md shadow-sm">
        <Button onClick={cancelDrawing}>Cancel</Button>
      </div>

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
