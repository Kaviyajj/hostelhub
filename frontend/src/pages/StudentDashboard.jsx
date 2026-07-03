import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users, Hotel, ShieldAlert, CalendarCheck, ClipboardList, BellRing,
  Plus, Check, X, Download, ShieldCheck, Mail, Phone, MapPin, User, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

const StudentDashboard = ({ activeTab, setActiveTab }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [fees, setFees] = useState([]);
  const [notices, setNotices] = useState([]);

  // Modals & Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'leave', 'complaint', 'pay'
  const [selectedFee, setSelectedFee] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchStudentData();
  }, [activeTab]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const dbRes = await api.getStudentDashboard();
      if (dbRes.success) {
        setDashboardData(dbRes);
      }

      if (activeTab === 'leaves') {
        const res = await api.getStudentLeaves();
        if (res.success) setLeaves(res.leaves);
      } else if (activeTab === 'complaints') {
        const res = await api.getStudentComplaints();
        if (res.success) setComplaints(res.complaints);
      } else if (activeTab === 'fees') {
        const res = await api.getStudentFees();
        if (res.success) setFees(res.fees);
      } else if (activeTab === 'notices') {
        const res = await api.getNotices();
        if (res.success) setNotices(res.notices);
      }
    } catch (err) {
      toast.error('Failed to load dashboard details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Leave Submit
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.applyLeave(formData);
      if (res.success) {
        toast.success('Leave application submitted successfully');
        setModalOpen(false);
        fetchStudentData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Complaint Submit
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.fileComplaint(formData);
      if (res.success) {
        toast.success('Complaint ticket filed successfully');
        setModalOpen(false);
        fetchStudentData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Fee Demo Payment
  const handleFeePayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.payFees({
        feeId: selectedFee.id,
        amountPaid: formData.amountPaid,
        paymentMethod: formData.paymentMethod || 'UPI'
      });
      if (res.success) {
        toast.success('Payment successful! Downlad receipt below.');
        setModalOpen(false);
        fetchStudentData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* --- STUDENT DASHBOARD OVERVIEW --- */}
      {!loading && activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Attendance Rate" value={`${dashboardData.attendance?.attendancePercentage}%`} icon={CalendarCheck} color="teal" description={`Marked present ${dashboardData.attendance?.presentDays} days`} />
            <StatCard title="Active Tickets" value={dashboardData.complaints?.pendingComplaints} icon={ShieldAlert} color="rose" description="Pending maintenance issues" />
            <StatCard title="Assigned Bed" value={dashboardData.roomDetails ? `Room ${dashboardData.roomDetails.roomNumber}` : 'Unassigned'} icon={Hotel} color="blue" description={dashboardData.roomDetails ? dashboardData.roomDetails.Block?.name : 'Admission Approved'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ID Card Display */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Identity Card</h4>
              <div className="p-6 bg-gradient-to-tr from-primary to-indigo-600 rounded-3xl text-white shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm leading-none">HostelHub Resident</h3>
                    <span className="text-[9px] uppercase tracking-wider opacity-60">ID Credential</span>
                  </div>
                  <ShieldCheck className="w-8 h-8 opacity-80" />
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold uppercase border border-white/20">
                    {dashboardData.student?.photoUrl ? (
                      <img src={`http://localhost:5000${dashboardData.student.photoUrl}`} className="w-full h-full object-cover rounded-2xl" alt="avatar" />
                    ) : dashboardData.student?.registerNumber?.substring(7, 10) || 'ST'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{dashboardData.student?.registerNumber}</h4>
                    <p className="text-xs opacity-80 capitalize">{dashboardData.student?.gender} | Dept: {dashboardData.student?.department}</p>
                    <p className="text-[10px] opacity-70">Contact: {dashboardData.student?.phone}</p>
                  </div>
                </div>

                {/* Mock QR Code Drawing */}
                <div className="flex justify-between items-end">
                  <div className="text-[9px] opacity-70">
                    <p>Parent: {dashboardData.student?.parentName}</p>
                    <p>{dashboardData.student?.address?.substring(0, 30)}...</p>
                  </div>
                  {/* Custom SVG QR code mock */}
                  <svg className="w-12 h-12 bg-white p-1 rounded-lg shrink-0" viewBox="0 0 25 25">
                    <path d="M0,0h7v7H0V0z M2,2v3h3V2H2z" fill="#000"/>
                    <path d="M18,0h7v7H18V0z M20,2v3h3V2H20z" fill="#000"/>
                    <path d="M0,18h7v7H0V18z M2,20v3h3V20H2z" fill="#000"/>
                    <path d="M8,1h3v2H8V1z M12,2h2v4h-2V2z M15,1h2v3h-2V1z" fill="#000"/>
                    <path d="M9,9h4v2H9V9z M15,8h4v3h-4V8z M10,13h5v2H10V13z" fill="#000"/>
                    <path d="M18,18h2v2h-2V18z M21,21h3v3h-3V21z M22,18h3v2h-3V18z" fill="#000"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Roommate details */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Accomodation & Roommates</h4>
              <div className="glass-card space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    {dashboardData.roomDetails ? `${dashboardData.roomDetails.Block?.name} - Room ${dashboardData.roomDetails.roomNumber}` : 'Unassigned'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Floor: {dashboardData.roomDetails?.floor || 'N/A'} | Room Capacity: {dashboardData.roomDetails?.capacity || 'N/A'} beds</p>
                </div>

                {dashboardData.roommates?.length === 0 ? (
                  <p className="text-xs text-slate-400">No roommates allocated in this room yet.</p>
                ) : (
                  <div className="space-y-4 border-t pt-4 border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Your Roommates:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardData.roommates?.map((mate, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl flex flex-col justify-between space-y-2">
                          <div>
                            <span className="font-bold text-xs text-slate-800 dark:text-white block">{mate.name}</span>
                            <span className="text-[10px] text-slate-450 capitalize">{mate.department} (Yr {mate.year})</span>
                          </div>
                          <div className="space-y-1 text-[10px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {mate.email}</span>
                            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {mate.phone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LEAVES TAB --- */}
      {!loading && activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Leave Requests</h3>
            <button onClick={() => { setFormData({ reason: '' }); setModalType('leave'); setModalOpen(true); }} className="btn-primary">
              <Plus className="w-4 h-4" /> Apply for Leave
            </button>
          </div>

          <div className="glass-card overflow-x-auto p-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Start Date</th>
                  <th className="p-4">End Date</th>
                  <th className="p-4">Reason for Leave</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td className="p-4 font-semibold">{l.startDate}</td>
                    <td className="p-4 font-semibold">{l.endDate}</td>
                    <td className="p-4">{l.reason}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        l.status === 'approved' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20' :
                        l.status === 'pending' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- COMPLAINTS TAB --- */}
      {!loading && activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Maintenance Tickets</h3>
            <button onClick={() => { setFormData({ type: 'internet', description: '' }); setModalType('complaint'); setModalOpen(true); }} className="btn-primary">
              <Plus className="w-4 h-4" /> Raise Complaint
            </button>
          </div>

          <div className="space-y-4">
            {complaints.map((comp) => (
              <div key={comp.id} className="glass-card p-6 flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold uppercase text-[9px]">
                      {comp.type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                      comp.status === 'resolved' ? 'bg-teal-50 text-teal-600' :
                      comp.status === 'pending' ? 'bg-rose-50 text-rose-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-normal">{comp.description}</p>
                  
                  {comp.assignedStaff && (
                    <div className="text-[10px] text-slate-400">
                      Staff Assigned: <span className="font-semibold text-slate-500">{comp.assignedStaff}</span>
                      {comp.resolutionNotes && <span> | Comments: {comp.resolutionNotes}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- FEES & PAYMENTS TAB --- */}
      {!loading && activeTab === 'fees' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Fee Invoices & Ledger</h3>
          <div className="space-y-6">
            {fees.map((fee) => {
              const totalAmount = parseFloat(fee.hostelFee) + parseFloat(fee.messFee);
              const paymentsTotal = fee.Payments?.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0) || 0;
              const balanceLeft = totalAmount - paymentsTotal;

              return (
                <div key={fee.id} className="glass-card p-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-850">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">Academic Year: {fee.academicYear}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Status: 
                        <span className={`ml-1 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                          fee.status === 'paid' ? 'bg-teal-50 text-teal-600' :
                          fee.status === 'pending' ? 'bg-rose-50 text-rose-600' :
                          'bg-orange-50 text-orange-600'
                        }`}>
                          {fee.status}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Total Billed:</span>
                      <h4 className="font-extrabold text-base text-slate-800 dark:text-white">INR {totalAmount.toLocaleString()}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Hostel Rent:</span>
                      <span className="font-semibold">INR {parseFloat(fee.hostelFee).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Mess Expenses:</span>
                      <span className="font-semibold">INR {parseFloat(fee.messFee).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Total Paid:</span>
                      <span className="font-semibold text-teal-500">INR {paymentsTotal.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Remaining Balance:</span>
                      <span className={`font-semibold ${balanceLeft > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                        INR {balanceLeft.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment history list */}
                  {fee.Payments?.length > 0 && (
                    <div className="border-t pt-4 border-slate-100 dark:border-slate-850 space-y-2.5">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payment Transaction History:</p>
                      {fee.Payments.map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white block">INR {parseFloat(p.amountPaid).toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">{p.transactionId} | Method: {p.paymentMethod}</span>
                          </div>
                          {/* Download PDF button link */}
                          <a
                            href={api.getReceiptDownloadUrl(p.id)}
                            download
                            className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 flex gap-1.5 items-center font-bold text-[10px]"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF Receipt
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Demo Payment button */}
                  {fee.status !== 'paid' && (
                    <button
                      onClick={() => {
                        setSelectedFee(fee);
                        setFormData({ amountPaid: balanceLeft, paymentMethod: 'UPI' });
                        setModalType('pay');
                        setModalOpen(true);
                      }}
                      className="btn-primary w-full py-2.5 mt-2"
                    >
                      Process Demo Online Payment
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- NOTICE BOARD TAB --- */}
      {!loading && activeTab === 'notices' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Campus Announcement Board</h3>
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold uppercase text-[9px]">
                    {notice.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(notice.publishDate).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{notice.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{notice.description}</p>
                {notice.pdfUrl && (
                  <a
                    href={`http://localhost:5000${notice.pdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                  >
                    <Download className="w-4 h-4" /> Download Attached Notice (PDF)
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- FORM MODALS --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700/60 space-y-6">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-white capitalize">
                {modalType === 'pay' ? 'Secure Checkout' : `Submit ${modalType}`}
              </h4>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {/* Leave Request Form */}
            {modalType === 'leave' && (
              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="form-input"
                  />
                  
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mt-2 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="form-input"
                  />
                  
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mt-2 mb-1">Reason for Leave</label>
                  <textarea
                    required
                    placeholder="e.g. Sister's wedding, Medical checkup, Vacation"
                    value={formData.reason || ''}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="form-input min-h-[90px]"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">Submit Application</button>
              </form>
            )}

            {/* Complaint Form */}
            {modalType === 'complaint' && (
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Category</label>
                  <select
                    value={formData.type || 'internet'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-input"
                  >
                    <option value="internet">Internet / Wi-Fi</option>
                    <option value="electrical">Electrical / Lights</option>
                    <option value="water">Water supply / Plumbing</option>
                    <option value="furniture">Furniture / Bed</option>
                    <option value="cleaning">Cleaning / Hygiene</option>
                    <option value="security">Hostel Security</option>
                    <option value="others">Others</option>
                  </select>
                  
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mt-2 mb-1">Describe Complaint details</label>
                  <textarea
                    required
                    placeholder="e.g. Faucet leakage in the restroom, internet speed drop, etc."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input min-h-[100px]"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">File Complaint Ticket</button>
              </form>
            )}

            {/* Demo Payment Form */}
            {modalType === 'pay' && (
              <form onSubmit={handleFeePayment} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Invoice reference ID</span>
                    <span className="font-bold text-xs text-slate-650 block">REF_BILL_{selectedFee?.id}_{selectedFee?.academicYear}</span>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod || 'UPI'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="form-input"
                    >
                      <option value="UPI">UPI (GPay / PhonePe)</option>
                      <option value="NetBanking">Net Banking</option>
                      <option value="CreditCard">Credit / Debit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Amount (INR)</label>
                    <input
                      type="number"
                      required
                      value={formData.amountPaid || ''}
                      onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) })}
                      className="form-input font-bold"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full btn-secondary py-2.5">Process Demo Transaction</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
