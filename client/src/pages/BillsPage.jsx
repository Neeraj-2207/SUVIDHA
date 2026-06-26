// BillsPage.jsx
// Shows all bills for the logged-in citizen
// Allows paying unpaid/overdue bills via Razorpay

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ─────────────────────────────────────────
// HELPER — bill type display config
// ─────────────────────────────────────────
const billConfig = {
  electricity: {
    label: 'Electricity',
    color: '#f59e0b',
    bg:    '#fffbeb',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )
  },
  water: {
    label: 'Water',
    color: '#0ea5e9',
    bg:    '#f0f9ff',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6 9 4 13.5 4 16a8 8 0 0 0 16 0c0-2.5-2-7-8-14z"/>
      </svg>
    )
  },
  property_tax: {
    label: 'Property Tax',
    color: '#8b5cf6',
    bg:    '#f5f3ff',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 4l9 5.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    )
  },
  gas: {
    label: 'Gas',
    color: '#ef4444',
    bg:    '#fef2f2',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c0 6-6 6-6 12a6 6 0 0 0 12 0c0-6-6-6-6-12z"/>
        <path d="M12 22v-4"/>
      </svg>
    )
  }
};

// ─────────────────────────────────────────
// Status badge component
// ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    unpaid:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Unpaid' },
    overdue: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Overdue' },
    paid:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Paid' }
  }[status];

  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: config.bg, color: config.color,
                   border: `0.5px solid ${config.border}` }}>
      {config.label}
    </span>
  );
};

// ─────────────────────────────────────────
// Summary card component
// ─────────────────────────────────────────
const SummaryCard = ({ label, value, color, prefix }) => (
  <div className="rounded-xl p-4"
       style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>
    <p className="text-xs uppercase tracking-wider mb-2"
       style={{ color: '#94a3b8' }}>
      {label}
    </p>
    <p className="text-2xl font-medium"
       style={{ color: color || '#0f172a', letterSpacing: '-0.02em' }}>
      {prefix}{value}
    </p>
  </div>
);

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
const BillsPage = () => {
  const { user }              = useAuth();
  const [bills, setBills]     = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [payingId, setPayingId] = useState(null); // which bill is being paid

  // Fetch bills on mount
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await API.get('/bills');
      setBills(response.data.bills);
      setSummary(response.data.summary);
    } catch (err) {
      setError('Could not load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // RAZORPAY PAYMENT HANDLER
  // ─────────────────────────────────────────
  const handlePayBill = async (bill) => {
    try {
      setPayingId(bill._id);

      // Step 1: Create order on backend
      const response = await API.post(`/bills/pay/${bill._id}`);
      const { order, razorpayKeyId } = response.data;

      // Step 2: Open Razorpay popup
      const options = {
        key:      razorpayKeyId,
        amount:   order.amount,          // in paise
        currency: 'INR',
        name:     'SUVIDHA',
        description: `${billConfig[bill.billType]?.label} Bill — ${bill.billingPeriod}`,
        order_id: order.id,
        prefill: {
          name:  user?.name,
          email: user?.email
        },
        theme: { color: '#4160bf' },

        // Step 3: On successful payment
        handler: async (paymentResponse) => {
          try {
            // Step 4: Verify on backend
            const verifyResponse = await API.post('/bills/verify', {
              razorpay_order_id:   paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature:  paymentResponse.razorpay_signature,
              billId:              bill._id
            });

            if (verifyResponse.data.success) {
              alert(`✅ Payment successful!\nPayment ID: ${paymentResponse.razorpay_payment_id}`);
              fetchBills(); // Refresh bills list
            }
          } catch (err) {
            alert('Payment verification failed. Contact support.');
          }
        },

        modal: {
          ondismiss: () => setPayingId(null)
        }
      };

      // Load Razorpay script and open popup
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setPayingId(null);
    }
  };

  // ─────────────────────────────────────────
  // RENDER STATES
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: '#94a3b8' }}>Loading bills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-6 px-4 py-3 rounded-lg text-sm"
           style={{ background: '#fef2f2', color: '#dc2626', border: '0.5px solid #fecaca' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-medium"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
          Bill Management
        </h2>
        <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
          View and pay your utility bills online.
        </p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Total Bills"   value={summary.total} />
          <SummaryCard label="Unpaid"        value={summary.unpaid}
                       color="#d97706" />
          <SummaryCard label="Overdue"       value={summary.overdue}
                       color="#dc2626" />
          <SummaryCard label="Total Due"     value={summary.totalDue.toLocaleString('en-IN')}
                       color="#4160bf" prefix="₹" />
        </div>
      )}

      {/* Bills table */}
      <div className="rounded-xl overflow-hidden"
           style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

        {/* Table header */}
        <div className="px-6 py-4 flex items-center justify-between"
             style={{ borderBottom: '0.5px solid #f1f5f9' }}>
          <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
            Your Bills
          </p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            {bills.length} bill{bills.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {bills.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-2xl mb-2">📄</p>
              <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                No bills found
              </p>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                Your utility bills will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                  {['Bill Type', 'Bill No.', 'Period', 'Amount', 'Due Date', 'Status', 'Action'].map(h => (
                    <th key={h}
                        className="px-6 py-3 text-left text-xs uppercase tracking-wider"
                        style={{ color: '#94a3b8' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bills.map((bill, index) => {
                  const config = billConfig[bill.billType];
                  const isLast = index === bills.length - 1;

                  return (
                    <tr key={bill._id}
                        style={{ borderBottom: isLast ? 'none' : '0.5px solid #f8fafc' }}>

                      {/* Bill Type */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                               style={{ background: config?.bg, color: config?.color }}>
                            {config?.icon}
                          </div>
                          <span className="text-sm font-medium"
                                style={{ color: '#0f172a' }}>
                            {config?.label}
                          </span>
                        </div>
                      </td>

                      {/* Bill Number */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono"
                              style={{ color: '#64748b' }}>
                          {bill.billNumber}
                        </span>
                      </td>

                      {/* Billing Period */}
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#64748b' }}>
                          {bill.billingPeriod}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium"
                              style={{ color: '#0f172a' }}>
                          ₹{bill.amount.toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4">
                        <span className="text-sm"
                              style={{
                                color: bill.status === 'overdue' ? '#dc2626' : '#64748b'
                              }}>
                          {new Date(bill.dueDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={bill.status} />
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        {bill.status === 'paid' ? (
                          <span className="text-xs" style={{ color: '#94a3b8' }}>
                            Paid ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePayBill(bill)}
                            disabled={payingId === bill._id}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                            style={{
                              background: payingId === bill._id ? '#e2e8f0' : '#4160bf',
                              color:      payingId === bill._id ? '#94a3b8'  : '#ffffff',
                              cursor:     payingId === bill._id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {payingId === bill._id ? 'Processing...' : 'Pay now'}
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillsPage;