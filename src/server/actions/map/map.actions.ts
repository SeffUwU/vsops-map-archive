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
    mediaIds?: string[],
  ) => {
    const now = new Date();

    const newFeature = await db.transaction(async (tx) => {
      const [insertedFeature] = await tx
        .insert(feature)
        .values({
          creatorId: requestUser.id,
          settlementId: properties.settlementId || null,
          properties: { ...properties, createdAt: now, creatorId: requestUser.id, updatedAt: now },
          geometry,
        })
        .returning();

      // mark uploaed media as used
      if (mediaIds && mediaIds.length > 0) {
        await tx
          .update(media)
          .set({ featureId: insertedFeature.id, used: true })
          .where(and(inArray(media.id, mediaIds), eq(media.userId, requestUser.id)));
      }

      return insertedFeature;
    });

    return ServerActionResponse(HttpStatusCode.Created, {
      type: 'Feature',
      id: newFeature.id,
      geometry: newFeature.geometry as object,
      properties: newFeature.properties as object,
    });
  },
);

export const updateMapCustomFeature = protect(
  async (
    requestUser,
    featureId: string,
    geometry: object,
    incomingProperties: Partial<VSMap.FeatureProperties>,
    mediaIds?: string[],
  ) => {
    const existing = await db.query.feature.findFirst({
      where: and(eq(feature.id, featureId), eq(feature.creatorId, requestUser.id)),
    });

    if (!existing) {
      return ServerActionError(HttpStatusCode.NotFound, ErrorCode.FeatureNotFound, requestUser.uiLocale);
    }

    const { creatorId, createdAt, ...restProps } = incomingProperties;

    const finalProperties = {
      ...existing.properties,
      ...restProps,
      updatedAt: new Date(),
    };

    await db.transaction(async (tx) => {
      // unlink old media
      await tx
        .update(media)
        .set({ featureId: null, used: false })
        .where(and(eq(media.featureId, featureId), eq(media.userId, requestUser.id)));

      // link new media
      if (mediaIds && mediaIds.length > 0) {
        await tx
          .update(media)
          .set({ featureId: featureId, used: true })
          .where(and(inArray(media.id, mediaIds), eq(media.userId, requestUser.id)));
      }

      // Update feature
      await tx
        .update(feature)
        .set({
          geometry,
          settlementId: finalProperties.settlementId || null,
          properties: finalProperties,
          updatedAt: new Date(),
        })
        .where(eq(feature.id, featureId));
    });

    const [updatedFeature] = await db.select().from(feature).where(eq(feature.id, featureId));

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
  });

  if (!targetFeature) {
    return ServerActionError(HttpStatusCode.NotFound, ErrorCode.FeatureNotFound, requestUser.uiLocale);
  }

  await db.transaction(async (tx) => {
    await tx.delete(media).where(eq(media.featureId, featureId));

    await tx.delete(feature).where(eq(feature.id, featureId));
  });

  // clean old data
  debouncedVacuum();

  return ServerActionResponse(HttpStatusCode.Ok, { deletedId: featureId });
});

export const getCustomLayerGeoJson = async (): ActionResponse<{ type: string; features: any[] }> => {
  try {
    const rows = await db.query.feature.findMany({
      with: {
        mediaItems: {
          columns: {
            data: false,
          },
        },
      },
    });

    const geoJson = {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature',
        id: row.id,
        geometry: row.geometry,
        properties: {
          ...row.properties,
          updatedAt: row.updatedAt,
          images: row.mediaItems,
        },
      })),
    };

    return ServerActionResponse(HttpStatusCode.Ok, geoJson);
  } catch (error) {
    console.error('GeoJSON Fetch Error:', error);
    return ServerActionResponse(HttpStatusCode.Ok, { type: 'FeatureCollection', features: [] });
  }
};
