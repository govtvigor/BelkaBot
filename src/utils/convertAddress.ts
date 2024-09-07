import { Address } from '@ton/core';


export function formatTonAddress(rawAddress: string): string {
  try {
    const address = Address.parse(rawAddress);
    return address.toString({ bounceable: false });
  } catch (error) {
    console.error('Error formatting address:', error);
    return '';
  }
}
