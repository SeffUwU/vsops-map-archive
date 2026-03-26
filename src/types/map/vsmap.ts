import type VectorLayer from 'ol/layer/Vector';
import { FeatureSubTypeEnum } from './dialog.configs';

export namespace VSMap {
  export interface TogglesState {
    landmarks: boolean;
    traders: boolean;
    chunks: boolean;
    translocators: boolean;
    custom: boolean;
  }

  export interface VectorLayersRef {
    landmarks: VectorLayer;
    traders: VectorLayer;
    chunks: VectorLayer;
    translocators: VectorLayer;
    custom: VectorLayer;
  }

  export type FeatureShape = 'square' | 'circle' | 'polygon' | 'road';

  export type FeatureProperties = {
    name: string;
    description: string;
    type: FeatureSubTypeEnum;
    images: string; // Comma separated images. TODO: I know.
    shapeType: FeatureShape;
    creatorId: string;
    createdAt: Date; // example: '2026-03-19T14:22:34.008Z'
    updatedAt: Date;
  };

  export type VisitedFeature = {
    id: string;
    visitedAt: Date;
  };
}
