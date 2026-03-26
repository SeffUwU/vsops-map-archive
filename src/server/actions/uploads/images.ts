'use server';

import { db } from '@/server/database';
import { media } from '@/entities/media';
import { and, eq } from 'drizzle-orm';
import { HttpStatusCode } from '@/helpers/responses/response.status';
import { ServerActionResponse } from '@/helpers/responses/base.response';
import { ServerActionError } from '@/helpers/errors/base.error';
import { ErrorCode } from '@/types/enums/error-code.enum';
import { protect } from '@/helpers/auth/protect.action';
import { TokenPayload } from '@/types/jwt/token.payload.type';
import { debouncedVacuum } from '@/server/maintanence/vacuum';

// export const uploadImageAction = protect(async (user: TokenPayload, formData: FormData) => {
//   const file = formData.get('file') as File;

//   if (!file) {
//     return ServerActionError(HttpStatusCode.BadRequest, ErrorCode.InvalidInput);
//   }

//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);

//   const [newMedia] = await db
//     .insert(media)
//     .values({
//       data: buffer,
//       mimeType: file.type,
//     })
//     .returning({ id: media.id });

//   return ServerActionResponse(HttpStatusCode.Created, { id: newMedia.id });
// });

export const deleteImageAction = protect(async (user: TokenPayload, mediaId: string) => {
  const deleted = await db
    .delete(media)
    .where(and(eq(media.id, mediaId), eq(media.userId, user.id)))
    .returning({ id: media.id });

  if (!deleted.length) {
    return ServerActionError(HttpStatusCode.NotFound, ErrorCode.FeatureNotFound);
  }
  // clean old data
  debouncedVacuum();

  return ServerActionResponse(HttpStatusCode.Ok, { deletedId: mediaId });
});
