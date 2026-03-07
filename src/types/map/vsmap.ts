import type VectorLayer from 'ol/layer/Vector';

export namespace VSMap {
  export interface TogglesState {
    landmarks: boolean;
    traders: boolean;
    chunks: boolean;
    translocators: boolean;
  }

  export interface VectorLayersRef {
    landmarks: VectorLayer;
    traders: VectorLayer;
    chunks: VectorLayer;
    translocators: VectorLayer;
    custom: VectorLayer;
  }

  export type CustomFeatureType = 'square' | 'circle' | 'polygon' | 'road';
}
