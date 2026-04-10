'use server';

import { settlement, ISettlement, INewSettlement } from '@/entities/settlement';
import { protect } from '@/helpers/auth/protect.action';
import { ServerActionError } from '@/helpers/errors/base.error';
import { ServerActionResponse } from '@/helpers/responses/base.response';
import { HttpStatusCode } from '@/helpers/responses/response.status';
import { ActionResponse } from '@/helpers/responses/response.type';
import { db } from '@/server/database';
import { ErrorCode } from '@/types/enums/error-code.enum';
import { and, eq } from 'drizzle-orm';

export const createSettlement = protect(
  async (requestUser, input: Omit<INewSettlement, 'id' | 'createdAt' | 'updatedAt' | 'creatorId'>) => {
    const now = new Date();
    const [newSettlement] = await db
      .insert(settlement)
      .values({
        ...input,
        creatorId: requestUser.id,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return ServerActionResponse(HttpStatusCode.Created, newSettlement as ISettlement);
  },
);

export const updateSettlement = protect(async (requestUser, settlementId: string, input: Partial<ISettlement>) => {
  const existing = await db.query.settlement.findFirst({
    where: and(eq(settlement.id, settlementId), eq(settlement.creatorId, requestUser.id)),
  });

  if (!existing) {
    return ServerActionError(HttpStatusCode.NotFound, ErrorCode.SettlementNotFound, requestUser.uiLocale);
  }

  const { creatorId, createdAt, ...restProps } = input;

  const finalProperties = {
    ...restProps,
    updatedAt: new Date(),
  };

  await db.update(settlement).set(finalProperties).where(eq(settlement.id, settlementId));

  const [updatedSettlement] = await db.select().from(settlement).where(eq(settlement.id, settlementId));

  return ServerActionResponse(HttpStatusCode.Ok, updatedSettlement as ISettlement);
});

export const deleteSettlement = protect(async (requestUser, settlementId: string) => {
  const targetSettlement = await db.query.settlement.findFirst({
    where: and(eq(settlement.id, settlementId), eq(settlement.creatorId, requestUser.id)),
  });

  if (!targetSettlement) {
    return ServerActionError(HttpStatusCode.NotFound, ErrorCode.SettlementNotFound, requestUser.uiLocale);
  }

  await db.delete(settlement).where(eq(settlement.id, settlementId));

  return ServerActionResponse(HttpStatusCode.Ok, { deletedId: settlementId });
});

export const getSettlements = async (): ActionResponse<ISettlement[]> => {
  const rows = await db.query.settlement.findMany();

  return ServerActionResponse(HttpStatusCode.Ok, rows as ISettlement[]);
};
