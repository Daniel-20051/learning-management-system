import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export interface WalletTransaction {
  id: number;
  transaction_type: 'credit' | 'debit';
  amount: number;
  purpose: string;
  reference_id?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalletTransactionsResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: {
    transactions: WalletTransaction[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface AddMoneyPayload {
  amount: number;
  payment_method?: string;
}

export interface AddMoneyResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: {
    public_key: string;
    tx_ref: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      name: string;
    };
    meta?: Record<string, any>;
  };
}

export interface FundWalletPayload {
  transaction_reference?: string;
  flutterwave_transaction_id?: string;
  amount: number;
}

export interface FundWalletResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: {
    transaction_id: string;
    amount: number;
    new_balance: number;
  };
}

export class WalletApi {
  /**
   * Get wallet transaction history
   * @param page Page number (default: 1)
   * @param limit Number of transactions per page (default: 20)
   */
  async GetTransactions(page: number = 1, limit: number = 20): Promise<WalletTransactionsResponse> {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/wallet/transactions?page=${page}&limit=${limit}`,
        {
          headers: getAuthHeaders()
        }
      );
      return response.data as WalletTransactionsResponse;
    } catch (err: any) {
      handleApiError(err, "getting wallet transactions");
      throw err;
    }
  }

  /**
   * Get Flutterwave public key from backend
   */
  async GetFlutterwavePublicKey(): Promise<{ public_key: string }> {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/wallet/flutterwave-public-key`,
        {
          headers: getAuthHeaders()
        }
      );
      return response.data as { public_key: string };
    } catch (err: any) {
      handleApiError(err, "getting Flutterwave public key");
      throw err;
    }
  }

  /**
   * Initiate adding money to wallet - returns Flutterwave payment data
   * @param payload Amount and payment method
   */
  async AddMoney(payload: AddMoneyPayload): Promise<AddMoneyResponse> {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/wallet/add-money`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );
      return response.data as AddMoneyResponse;
    } catch (err: any) {
      handleApiError(err, "initiating wallet payment");
      throw err;
    }
  }

  /**
   * Fund wallet after Flutterwave payment verification
   * @param payload Transaction reference, Flutterwave transaction ID, and amount
   */
  async FundWallet(payload: FundWalletPayload): Promise<FundWalletResponse> {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/wallet/fund`,
        payload,
        {
          headers: getAuthHeaders()
        }
      );
      return response.data as FundWalletResponse;
    } catch (err: any) {
      handleApiError(err, "funding wallet");
      throw err;
    }
  }
}

// Export standalone function for backward compatibility
export async function GetWalletTransactions(page: number = 1, limit: number = 20) {
  const api = new WalletApi();
  return api.GetTransactions(page, limit);
}

export async function AddMoneyToWallet(payload: AddMoneyPayload) {
  const api = new WalletApi();
  return api.AddMoney(payload);
}

