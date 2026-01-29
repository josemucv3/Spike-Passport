export interface TokenResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  token_id: string;
  scopes?: string[];
  account_id?: string;
  created_at: string;
  roles?: string[];
}

