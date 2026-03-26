'use server';

import { feature } from '@/entities/feature';
import { media } from '@/entities/media';
import { protect } from '@/helpers/auth/protect.action';
import { ServerActionError } from '@/helpers/errors/base.error';
import { ServerActionResponse } from '@/helpers/responses/base.response';
import { HttpStatusCode } from '@/helpers/responses/response.status';
import { ActionResponse } from '@/helpers/responses/response.type';
import { db } from '@/server/database';
import { debouncedVacuum } from '@/server/maintanence/vacuum';
import { ErrorCode } from '@/types/enums/error-code.enum';
import { VSMap } from '@/types/map/vsmap';
import { PartialBy } from '@/types/utils/utils.types';
import { and, eq, inArray, sql } from 'drizzle-orm';
import Feature from 'ol/Feature';

export const addMapCustomMapFeature = protect(
  async (
    requestUser,
    geometry: object,
    properties: PartialBy<VSMap.FeatureProperties, 'creatorId' | 'createdAt' | 'updatedAt'>,
  ) => {
    const now = new Date();
    const [newFeature] = await db
      .insert(feature)
      .values({
        creatorId: requestUser.id,
        properties: { ...properties, createdAt: now, creatorId: requestUser.id, updatedAt: now },
        geometry,
      })
      .returning();

    // TODO: acutally update used images.. so they won't stick around
    return ServerActionResponse(HttpStatusCode.Created, {
      type: 'Feature',
      id: newFeature.id,
      geometry: newFeature.geometry as object,
      properties: newFeature.properties as object,
    });
  },
);

export const updateMapCustomFeature = protect(
  async (requestUser, featureId: string, geometry: object, incomingProperties: Partial<VSMap.FeatureProperties>) => {
    const existing = await db.query.feature.findFirst({
      where: and(eq(feature.id, featureId), eq(feature.creatorId, requestUser.id)),
    });

    if (!existing) {
      return ServerActionError(HttpStatusCode.NotFound, ErrorCode.FeatureNotFound, requestUser.uiLocale);
    }
    // TODO: acutally update used images.. so they won't stick around

    const { creatorId, createdAt, ...restProps } = incomingProperties;

    const finalProperties = {
      ...existing.properties,
      ...restProps,
      updatedAt: new Date(),
    };

    const [updatedFeature] = await db
      .update(feature)
      .set({
        geometry,
        properties: finalProperties,
        updatedAt: new Date(),
      })
      .where(eq(feature.id, featureId))
      .returning();

    return ServerActionResponse(HttpStatusCode.Ok, {
      type: 'Feature',
      id: updatedFeature.id,
      geometry: updatedFeature.geometry as object,
      properties: { ...updatedFeature.properties, updatedAt: updatedFeature.updatedAt } as VSMap.FeatureProperties,
    });
  },
);

export const deleteCustomMapFeature = protect(async (requestUser, featureId: string) => {
  const targetFeature = await db.query.feature.findFirst({
    where: and(eq(feature.id, featureId), eq(feature.creatorId, requestUser.id)),
    columns: {
      properties: true,
    },
  });

  if (!targetFeature) {
    return ServerActionError(HttpStatusCode.NotFound, ErrorCode.FeatureNotFound, requestUser.uiLocale);
  }

  const imageIdsString = (targetFeature.properties as any)?.images as string | undefined;
  const imageIds = imageIdsString
    ? imageIdsString
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  await db.transaction(async (tx) => {
    if (imageIds.length > 0) {
      await tx.delete(media).where(and(inArray(media.id, imageIds), eq(media.userId, requestUser.id)));
    }

    await tx.delete(feature).where(eq(feature.id, featureId));
  });

  // clean old data
  debouncedVacuum();

  return ServerActionResponse(HttpStatusCode.Ok, { deletedId: featureId });
});

export const getCustomLayerGeoJson = async (): ActionResponse<{ type: string; features: any[] }> => {
  try {
    const rows = await db.select().from(feature);

    const geoJson = {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature',
        id: row.id,
        geometry: row.geometry,
        properties: { ...row.properties, updatedAt: row.updatedAt } as VSMap.FeatureProperties,
      })),
    };

    return ServerActionResponse(HttpStatusCode.Ok, geoJson);
  } catch (error) {
    console.error('GeoJSON Fetch Error:', error);
    return ServerActionResponse(HttpStatusCode.Ok, { type: 'FeatureCollection', features: [] });
  }
};
