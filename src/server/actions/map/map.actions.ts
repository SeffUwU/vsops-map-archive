'use server';

import { feature } from '@/entities/feature';
import { protect } from '@/helpers/auth/protect.action';
import { ServerActionError } from '@/helpers/errors/base.error';
import { ServerActionResponse } from '@/helpers/responses/base.response';
import { HttpStatusCode } from '@/helpers/responses/response.status';
import { ActionResponse } from '@/helpers/responses/response.type';
import { db } from '@/server/database';
import { ErrorCode } from '@/types/enums/error-code.enum';
import { and, eq, sql } from 'drizzle-orm';
import Feature from 'ol/Feature';
// TODO: types
export const addMapCustomMapFeature = protect(async (requestUser, geometry: object, properties: object = {}) => {
  const [newFeature] = await db
    .insert(feature)
    .values({
      creatorId: requestUser.id,
      geometry,
      properties: { ...properties, creatorId: requestUser.id, createdAt: new Date() },
    })
    .returning();

  return ServerActionResponse(HttpStatusCode.Created, {
    type: 'Feature',
    id: newFeature.id,
    geometry: newFeature.geometry as object,
    properties: newFeature.properties as object,
  });
});

export const updateMapCustomFeature = protect(
  async (requestUser, featureId: string, geometry: object, properties: object = {}) => {
    const [updatedFeature] = await db
      .update(feature)
      .set({
        geometry,
        properties,
        updatedAt: new Date(),
      })
      .where(and(eq(feature.id, featureId), eq(feature.creatorId, requestUser.id)))
      .returning();

    if (!updatedFeature) {
      return ServerActionError(HttpStatusCode.NotFound, ErrorCode.FeatureNotFound, requestUser.uiLocale);
    }

    return ServerActionResponse(HttpStatusCode.Ok, {
      type: 'Feature',
      id: updatedFeature.id,
      geometry: updatedFeature.geometry as object,
      properties: updatedFeature.properties as object,
    });
  },
);

export const deleteCustomMapFeature = protect(async (requestUser, featureId: string) => {
  const deleted = await db
    .delete(feature)
    .where(and(eq(feature.id, featureId), eq(feature.creatorId, requestUser.id)))
    .returning({ id: feature.id });

  if (!deleted.length) {
    return ServerActionError(HttpStatusCode.NotFound, ErrorCode.FeatureNotFound, requestUser.uiLocale);
  }

  return ServerActionResponse(HttpStatusCode.Ok, { deletedId: featureId });
});

export const getCustomLayerGeoJson = async (): ActionResponse<{ type: string; features: Feature[] }> => {
  const result = await db.execute(sql`
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', id,
            'geometry', geometry,
            'properties', properties
          )
        ),
        '[]'::jsonb
      )
    ) AS "geoJson"
    FROM ${feature}
  `);

  const row = result.rows[0] as { geoJson: any } | undefined;

  return ServerActionResponse(
    HttpStatusCode.Ok,
    row?.geoJson ?? ({ type: 'FeatureCollection', features: [] } as { type: string; features: Feature[] }),
  );
};
