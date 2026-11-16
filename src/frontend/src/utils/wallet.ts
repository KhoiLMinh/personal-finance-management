export type WalletPermission = 'OWNER' | 'EDIT' | 'VIEW';

export interface Wallet {
  id: number;
  name: string;
  balance: number;
  icon?: string | null;
  color?: string | null;
  myPermission?: WalletPermission;
}

// Backend is the authority (403 on write); these only keep the UI from offering actions that will be refused.
export const canWriteWallet = (w: Wallet) => w.myPermission !== 'VIEW';
export const isOwnWallet = (w: Wallet) => !w.myPermission || w.myPermission === 'OWNER';

export const permissionLabel: Record<WalletPermission, string> = {
  OWNER: 'Ví của bạn',
  EDIT: 'Được chia sẻ · Chỉnh sửa',
  VIEW: 'Được chia sẻ · Chỉ xem',
};
