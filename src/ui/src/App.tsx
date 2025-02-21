import React, { useState, useEffect } from 'react';

interface Beneficiary {
  id?: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  account_name: string;
  amount?: number;
}

interface Bank {
  name: string;
  code: string;
}

const banks: Bank[] = [
  { name: 'Wema Bank', code: '035' },
  { name: 'Stanbic IBTC', code: '221' },
  { name: 'Access Bank', code: '044' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Kuda Bank', code: '50211' },
];

const BulkTransfer: React.FC = () => {
  const [recipients, setRecipients] = useState<Beneficiary[]>([]);
  const [savedBeneficiaries, setSavedBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedBeneficiaries();
  }, []);

  const fetchSavedBeneficiaries = async () => {
    try {
      const response = await fetch('/api/beneficiaries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSavedBeneficiaries(data.beneficiaries);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, {
      account_number: '',
      bank_code: '',
      bank_name: '',
      account_name: '',
      amount: 0
    }]);
  };

  const removeRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };

  const updateRecipient = (index: number, field: keyof Beneficiary, value: string | number) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  const saveBeneficiary = async (beneficiary: Beneficiary) => {
    try {
      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(beneficiary)
      });
      
      if (response.ok) {
        fetchSavedBeneficiaries();
      }
    } catch (error) {
      console.error('Error saving beneficiary:', error);
    }
  };

  const handleBulkTransfer = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/accounts/bulk-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(recipients)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      // Handle success
      setRecipients([]);
    } catch (error: any) {
      setError(error.message || 'Failed to process bulk transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bulk Transfer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={addRecipient}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Recipient
        </button>
      </div>

      {recipients.map((recipient, index) => (
        <div key={index} className="border p-4 mb-4 rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Bank</label>
              <select
                value={recipient.bank_code}
                onChange={(e) => {
                  const bank = banks.find(b => b.code === e.target.value);
                  updateRecipient(index, 'bank_code', e.target.value);
                  updateRecipient(index, 'bank_name', bank?.name || '');
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Bank</option>
                {banks.map(bank => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Account Number</label>
              <input
                type="text"
                value={recipient.account_number}
                onChange={(e) => updateRecipient(index, 'account_number', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Account Name</label>
              <input
                type="text"
                value={recipient.account_name}
                onChange={(e) => updateRecipient(index, 'account_name', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Amount</label>
              <input
                type="number"
                value={recipient.amount}
                onChange={(e) => updateRecipient(index, 'amount', parseFloat(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => removeRecipient(index)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Remove
            </button>
            <button
              onClick={() => saveBeneficiary(recipient)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save as Beneficiary
            </button>
          </div>
        </div>
      ))}

      {recipients.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleBulkTransfer}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            {loading ? 'Processing...' : 'Process Bulk Transfer'}
          </button>
        </div>
      )}

      {savedBeneficiaries.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Saved Beneficiaries</h2>
          <div className="grid grid-cols-1 gap-4">
            {savedBeneficiaries.map((beneficiary) => (
              <div key={beneficiary.id} className="border p-4 rounded">
                <p><strong>Name:</strong> {beneficiary.account_name}</p>
                <p><strong>Bank:</strong> {beneficiary.bank_name}</p>
                <p><strong>Account:</strong> {beneficiary.account_number}</p>
                <button
                  onClick={() => {
                    setRecipients([...recipients, { ...beneficiary, amount: 0 }]);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                >
                  Add to Recipients
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkTransfer;
