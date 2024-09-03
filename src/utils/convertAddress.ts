// src/utils/convertAddress.ts
import { Address } from '@ton/core';

// Преобразование RAW адреса в Non-bouncable формат
export function formatTonAddress(rawAddress: string): string {
  try {
    // Преобразование RAW адреса в объект Address
    const address = Address.parse(rawAddress);

    // Получение Non-bouncable адреса
    return address.toString({ bounceable: false });
  } catch (error) {
    console.error('Error formatting address:', error);
    return '';
  }
}
