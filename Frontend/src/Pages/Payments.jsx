// src/pages/Payment.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import toast, { Toaster } from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Payment() {
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [enrollClassId, setEnrollClassId] = useState('');
  const [enrollMonth, setEnrollMonth] = useState(dayjs().format('YYYY-MM'));
  const [enrollMethod, setEnrollMethod] = useState('cash');
  const [enrollReference, setEnrollReference] = useState('');

  const [paying, setPaying] = useState(false);

  useEffect(() => {
    load();
  }, [studentId]);

  async function load() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/payments/student/${studentId}`);
      setData(data);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.error || 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }

  async function payForClass(classId, month, amount, method = 'cash', reference = '') {
    try {
      setPaying(true);
      await axios.post(`${API}/payments`, {
        studentId,
        classId,
        month,
        amount,
        method,
        reference
      });
      toast.success('Payment recorded');
      await load();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.error || 'Failed to record payment');
    } finally {
      setPaying(false);
    }
  }

  async function enrollAndPay() {
    if (!enrollClassId) return toast.error('Select a class');
    try {
      setPaying(true);
      const cls = data.availableClasses.find(c => c._id === enrollClassId);
      await axios.post(`${API}/payments/enroll-and-pay`, {
        studentId,
        classId: enrollClassId,
        month: enrollMonth,
        amount: cls?.fee,
        method: enrollMethod,
        reference: enrollReference
      });
      toast.success('Enrolled & paid!');
      setEnrollClassId('');
      setEnrollReference('');
      await load();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.error || 'Failed to enroll & pay');
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <Toaster />
        <p>Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Toaster />
        <p className="text-red-500">No data</p>
      </div>
    );
  }

  const thisMonth = dayjs().format('YYYY-MM');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/" className="text-sm underline text-gray-500 hover:text-gray-700">&larr; Back</Link>
          <h1 className="text-2xl font-bold mt-2">
            Payments — {data.student.name} ({data.student.nic})
          </h1>
          <p className="text-gray-500">{data.student.email}</p>
        </div>
      </div>

      {/* Enroll & Pay */}
      <div className="bg-white shadow rounded-lg p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Enroll in new class & Pay</h2>
        {data.availableClasses.length === 0 ? (
          <p className="text-gray-500 text-sm">No available classes (already enrolled in all).</p>
        ) : (
          <div className="grid sm:grid-cols-5 gap-3">
            <select
              className="border rounded px-2 py-2"
              value={enrollClassId}
              onChange={e => setEnrollClassId(e.target.value)}
            >
              <option value="">Select class</option>
              {data.availableClasses.map(cls => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} — {cls.subject} (Rs. {cls.fee})
                </option>
              ))}
            </select>

            <input
              type="month"
              className="border rounded px-2 py-2"
              value={enrollMonth}
              onChange={(e) => setEnrollMonth(e.target.value)}
            />

            <select
              className="border rounded px-2 py-2"
              value={enrollMethod}
              onChange={e => setEnrollMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
              <option value="bank">Bank</option>
              <option value="other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Reference (optional)"
              className="border rounded px-2 py-2"
              value={enrollReference}
              onChange={(e) => setEnrollReference(e.target.value)}
            />

            <button
              disabled={paying}
              onClick={enrollAndPay}
              className={`px-4 py-2 rounded text-white ${paying ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {paying ? 'Processing...' : 'Enroll & Pay'}
            </button>
          </div>
        )}
      </div>

      {/* Enrolled Classes + Payments */}
      <div className="space-y-6">
        {data.enrolled.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-4">
            Student is not enrolled in any classes.
          </div>
        )}

        {data.enrolled.map((ec, i) => {
          const cls = ec.class;
          const defaultAmount = cls?.fee ?? 0;

          return (
            <ClassPaymentCard
              key={cls._id || i}
              cls={cls}
              ec={ec}
              thisMonth={thisMonth}
              defaultAmount={defaultAmount}
              onPay={(params) => payForClass(cls._id, params.month, params.amount, params.method, params.reference)}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Component for each class block with its own state
 */
function ClassPaymentCard({ cls, ec, thisMonth, defaultAmount, onPay }) {
  const [payMonth, setPayMonth] = useState(thisMonth);
  const [payMethod, setPayMethod] = useState('cash');
  const [payRef, setPayRef] = useState('');
  const [payAmount, setPayAmount] = useState(defaultAmount);
  const [openHistory, setOpenHistory] = useState(true);
  const [processing, setProcessing] = useState(false);

  async function submitPayment() {
    try {
      setProcessing(true);
      await onPay({
        month: payMonth,
        amount: Number(payAmount),
        method: payMethod,
        reference: payRef
      });
      setPayRef('');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{cls.className} — {cls.subject}</h3>
          <p className="text-sm text-gray-500">
            Teacher: {cls.teacher?.name} | Fee: Rs. {cls.fee} | {cls.day} {cls.time}
          </p>
        </div>

        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            ec.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {ec.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm">This month ({thisMonth}):</span>
        {ec.paidThisMonth ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">PAID</span>
        ) : (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">NOT PAID</span>
        )}
      </div>

      {/* Pay Form */}
      <div className="mt-4 grid sm:grid-cols-5 gap-3 items-end">
        <input
          type="month"
          className="border rounded px-2 py-2"
          value={payMonth}
          onChange={e => setPayMonth(e.target.value)}
        />
        <input
          type="number"
          className="border rounded px-2 py-2"
          value={payAmount}
          onChange={e => setPayAmount(e.target.value)}
          min={0}
        />
        <select
          className="border rounded px-2 py-2"
          value={payMethod}
          onChange={e => setPayMethod(e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="online">Online</option>
          <option value="bank">Bank</option>
          <option value="other">Other</option>
        </select>
        <input
          type="text"
          className="border rounded px-2 py-2"
          placeholder="Reference (optional)"
          value={payRef}
          onChange={e => setPayRef(e.target.value)}
        />
        <button
          disabled={processing}
          onClick={submitPayment}
          className={`px-4 py-2 rounded text-white ${processing ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {processing ? 'Saving...' : 'Pay'}
        </button>
      </div>

      {/* History */}
      <div className="mt-4">
        <button
          onClick={() => setOpenHistory(!openHistory)}
          className="text-sm text-indigo-600 hover:underline"
        >
          {openHistory ? 'Hide' : 'Show'} Payment History ({ec.history.length})
        </button>

        {openHistory && (
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Month</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Method</th>
                  <th className="py-2 pr-4">Reference</th>
                  <th className="py-2 pr-4">Paid At</th>
                </tr>
              </thead>
              <tbody>
                {ec.history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-2 text-gray-500">
                      No payments yet.
                    </td>
                  </tr>
                ) : (
                  ec.history.map(h => (
                    <tr key={h._id} className="border-b last:border-b-0">
                      <td className="py-2 pr-4">{h.month}</td>
                      <td className="py-2 pr-4">Rs. {h.amount}</td>
                      <td className="py-2 pr-4">{h.method}</td>
                      <td className="py-2 pr-4">{h.reference || '—'}</td>
                      <td className="py-2 pr-4">{dayjs(h.paidAt).format('YYYY-MM-DD HH:mm')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
