import { GeinsCore } from '@geins/core';
import type { GeinsSettings } from '@geins/types';

export function geinsObjectFromToken(token: string): any {
  const payload = GeinsCore.decodeJWT(token);
  return payload;
}

export function geinsSettingsFromToken(token: string): GeinsSettings {
  const payload = geinsObjectFromToken(token);
  console.log('PAYLOAD::', payload);
  return payload.geinsSettings;
}

export function getCartIdFromToken(token: string): string {
  const payload = geinsObjectFromToken(token);
  return payload.cartId;
}

/* export const validSettings: GeinsSettings = {
  apiKey: process.env.GEINS_API_KEY!,
  accountName: process.env.GEINS_ACCOUNT_NAME!,
  channel: process.env.GEINS_CHANNEL!,
  tld: process.env.GEINS_TLD!,
  locale: process.env.GEINS_LOCALE!,
  market: process.env.GEINS_MARKET!,
  environment: (process.env.GEINS_ENVIRONMENT || 'prod') as Environment,
}; */
