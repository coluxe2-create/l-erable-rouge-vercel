import crypto from 'crypto';

export interface CmiParams {
  clientid: string;
  amount: string;
  okUrl: string;
  failUrl: string;
  TranType: string;
  callbackUrl: string;
  shopurl: string;
  currency: string;
  rnd: string;
  storetype: string;
  hashAlgorithm: string;
  lang: string;
  encoding: string;
  oid: string;
  [key: string]: string;
}

export function generateCmiHash(params: CmiParams, storeKey: string): string {
  // CMI signature logic:
  // 1. Sort keys alphabetically (case-insensitive)
  // 2. Concatenate values with | separator
  // 3. Append storeKey at the end
  // 4. Hash with SHA-512 (or SHA-256 depending on config)
  
  const sortedKeys = Object.keys(params)
    .filter(key => key !== 'HASH' && key !== 'encoding')
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  let hashString = '';
  for (const key of sortedKeys) {
    const value = params[key].replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
    hashString += value + '|';
  }
  
  hashString += storeKey;

  return crypto
    .createHash('sha512')
    .update(hashString, 'utf-8')
    .digest('base64');
}
