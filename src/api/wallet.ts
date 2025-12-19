import axios from 'axios';
import { BASE_URL, getAuthHeaders, handleApiError } from './base';

export interface WalletTransaction {
  id: number;
  type: 'Credit' | 'Debit';
  amount: number;
  currency: string;
  service_name: string;
  ref: string;
  date: string;
  semester?: string | null;
  academic_year?: string | null;
  balance: number;
  // Legacy fields for backward compatibility
  transaction_type?: 'credit' | 'debit';
  purpose?: string;
  reference_id?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WalletTransactionsFilters {
  type?: 'Credit' | 'Debit';
  semester?: string;
  academic_year?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface WalletTransactionsResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: {
    transactions: WalletTransaction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    summary: {
      currency: string;
      total_credits: number;
      total_debits: number;
    };
  };
  // Legacy structure support
  transactions?: WalletTransaction[];
  total?: number;
  page?: number;
  limit?: number;
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

export interface ExchangeRateResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: {
    exchange_rate: number;
    from_currency: string;
    to_currency: string;
    description: string;
  };
}

export class WalletApi {
  /**
   * Get wallet transaction history with filtering and pagination
   * @param filters Filter options including page, limit, type, semester, academic_year, start_date, end_date
   */
  async GetTransactions(filters: WalletTransactionsFilters = {}): Promise<WalletTransactionsResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add pagination params
      params.append('page', String(filters.page || 1));
      params.append('limit', String(filters.limit || 50));
      
      // Add filter params if provided
      if (filters.type) {
        params.append('type', filters.type);
      }
      if (filters.semester) {
        params.append('semester', filters.semester);
      }
      if (filters.academic_year) {
        params.append('academic_year', filters.academic_year);
      }
      if (filters.start_date) {
        params.append('start_date', filters.start_date);
      }
      if (filters.end_date) {
        params.append('end_date', filters.end_date);
      }
      
      const response = await axios.get(
        `${BASE_URL}/api/wallet/transactions?${params.toString()}`,
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

  /**
   * Get exchange rate from API
   */
  async GetExchangeRate(): Promise<ExchangeRateResponse> {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/wallet/rate`,
        {
          headers: getAuthHeaders()
        }
      );
      return response.data as ExchangeRateResponse;
    } catch (err: any) {
      handleApiError(err, "getting exchange rate");
      throw err;
    }
  }
}

// Export standalone function for backward compatibility
export async function GetWalletTransactions(filters: WalletTransactionsFilters = {}) {
  const api = new WalletApi();
  return api.GetTransactions(filters);
}

export async function AddMoneyToWallet(payload: AddMoneyPayload) {
  const api = new WalletApi();
  return api.AddMoney(payload);
}

