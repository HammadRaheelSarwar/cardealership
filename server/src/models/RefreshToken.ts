export interface IRefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at?: string;
  created_at: string;
}
export type RefreshToken = IRefreshToken;
