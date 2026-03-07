import { TileGrid } from 'ol/tilegrid';
import { config } from './config';
import { MousePosition } from 'ol/control';
import { toStringXY } from 'ol/coordinate';

export const mapIcons = {
  Traders: `${config.vsmBaseUrl}/assets/icons/waypoints/trader.svg`,
  Translocators: `${config.vsmBaseUrl}/assets/icons/waypoints/spiral.svg`,
  Landmarks: {
    Base: `${config.vsmBaseUrl}/assets/icons/waypoints/home.svg`,
    Misc: `${config.vsmBaseUrl}/assets/icons/waypoints/star1.svg`,
    Server: `${config.vsmBaseUrl}/assets/icons/temporal_gear.png`,
  },
  'Explored Chunks': `${config.vsmBaseUrl}/assets/icons/default/square.png`,
};

export const mapColorRef = {
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

const X_OFFSET = 162282;
const Y_OFFSET = -211885;

export const vintageStoryWorldGrid = new TileGrid({
  extent: [-512000, -512000, 512000, 512000],
  origin: [-512000 + X_OFFSET, 512000 + Y_OFFSET],
  resolutions: [512, 256, 128, 64, 32, 16, 8, 4, 2, 1],
  tileSize: [256, 256],
});

export const mapMousePosController = new MousePosition({
  coordinateFormat: function (coordinate) {
    return toStringXY([coordinate![0], -coordinate![1]], 0);
  },
  className: 'coords',
  target: 'mouse-position-out',
});
