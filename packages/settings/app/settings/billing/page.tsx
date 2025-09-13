'use client';

import React, { useState, useEffect } from 'react';

interface WalletData {
  balance: number;
  currency: string;
}

interface AutoRechargeSettings {
  enabled: boolean;
  threshold: number;
  amount: number;
  paymentMethodId?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  cardBrand?: string;
  last4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  invoiceItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

export default function BillingPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [autoRecharge, setAutoRecharge] = useState<AutoRechargeSettings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Purchase form state
  const [purchaseAmount, setPurchaseAmount] = useState(100);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [walletRes, autoRechargeRes, paymentMethodsRes, invoicesRes] = await Promise.all([
        fetch('/api/v1/billing/wallet'),
        fetch('/api/v1/billing/auto-recharge'),
        fetch('/api/v1/billing/payment-methods'),
        fetch('/api/v1/billing/invoices?limit=10')
      ]);

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWallet(walletData);
      }

      if (autoRechargeRes.ok) {
        const autoRechargeData = await autoRechargeRes.json();
        setAutoRecharge(autoRechargeData);
      }

      if (paymentMethodsRes.ok) {
        const paymentMethodsData = await paymentMethodsRes.json();
        setPaymentMethods(paymentMethodsData.paymentMethods || []);
        
        // Set default payment method if none selected
        const defaultMethod = paymentMethodsData.paymentMethods?.find((pm: PaymentMethod) => pm.isDefault);
        if (defaultMethod && !selectedPaymentMethod) {
          setSelectedPaymentMethod(defaultMethod.id);
        }
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.invoices || []);
      }
    } catch (err) {
      setError('Failed to load billing data');
      console.error('Error loading billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setPurchaseLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/billing/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: purchaseAmount,
          paymentMethodId: selectedPaymentMethod
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Reload wallet data
        const walletRes = await fetch('/api/v1/billing/wallet');
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWallet(walletData);
        }
        setPurchaseAmount(100); // Reset form
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Purchase failed');
      }
    } catch (err) {
      setError('Purchase failed');
      console.error('Error making purchase:', err);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleAutoRechargeUpdate = async (settings: Partial<AutoRechargeSettings>) => {
    try {
      const response = await fetch('/api/v1/billing/auto-recharge', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setAutoRecharge(updatedSettings);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update auto-recharge');
      }
    } catch (err) {
      setError('Failed to update auto-recharge');
      console.error('Error updating auto-recharge:', err);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Usage</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Wallet Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Account Balance</h2>
        {wallet && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(wallet.balance, wallet.currency)}
              </p>
              <p className="text-gray-500 text-sm">Available balance</p>
            </div>
            <button
              onClick={() => loadBillingData()}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Purchase Credits Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Purchase Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                min="10"
                max="10000"
                step="10"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                className="pl-8 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select payment method</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.cardBrand?.toUpperCase()} •••• {method.last4}
                  {method.isDefault && ' (Default)'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handlePurchase}
            disabled={purchaseLoading || !selectedPaymentMethod}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {purchaseLoading ? 'Processing...' : `Purchase ${formatCurrency(purchaseAmount)}`}
          </button>
        </div>
      </div>

      {/* Auto-recharge Section */}
      {autoRecharge && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Auto-recharge</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={autoRecharge.enabled}
                onChange={(e) => handleAutoRechargeUpdate({ enabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-900">
                Enable auto-recharge
              </label>
            </div>
            {autoRecharge.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recharge when balance falls below
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      min="10"
                      value={autoRecharge.threshold}
                      onChange={(e) => handleAutoRechargeUpdate({ threshold: Number(e.target.value) })}
                      className="pl-8 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recharge amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      min="10"
                      value={autoRecharge.amount}
                      onChange={(e) => handleAutoRechargeUpdate({ amount: Number(e.target.value) })}
                      className="pl-8 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Invoices */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h2>
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{invoice.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No invoices found</p>
        )}
      </div>
    </div>
  );
}
