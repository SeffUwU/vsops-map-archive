import { ErrorCode } from '@/types/enums/error-code.enum';

export const EnglishErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.UsernameTaken]: 'Username taken.',
  [ErrorCode.NotAuthorized]: 'Not authorized.',
  [ErrorCode.TokenExpired]: 'Session expired.',
  [ErrorCode.UserNotFound]: 'User not found.',
  [ErrorCode.CampaignCodeMustNotBeEmpty]: 'Campaign code field must not be empty.',
  [ErrorCode.CreatorCantJoinHisOwnCampaign]: 'Campaign creator cannot join his own campaign.',
  [ErrorCode.CampaignAlreadyJoined]: "You're already apart of this campaign.",
  [ErrorCode.CampaignNotFound]: 'Campaign not found.',
  [ErrorCode.InternalServerError]: 'There was a server-side error. Contact US if this issue persist.',
  [ErrorCode.FeatureNotFound]: 'Map feature is not found',
  [ErrorCode.SettlementNotFound]: 'Settlement not found',
  [ErrorCode.InvalidSignUpCode]: 'Invalid sign up code',
  [ErrorCode.InvalidInput]: 'Invalid input',
};
