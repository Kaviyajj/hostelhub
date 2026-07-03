import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users, Hotel, ShieldAlert, CalendarCheck, BookOpen, Plus, Check, X, LogOut, ClipboardList, Edit, BellRing
} from 'lucide-react';
import { toast } from 'react-toastify';

const WardenDashboard = ({ activeTab, setActiveTab }) => {
  const [loading, setLoading] = useState(true);
  const [blockInfo, setBlockInfo] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [visitors, setVisitors] = useState([]);
  
  // Attendance Mark States
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'present'/'absent'/'leave' }

  // Modals & form fields
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'visitor', 'complaint'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchWardenData();
  }, [activeTab]);

  const fetchWardenData = async () => {
    setLoading(true);
    try {
      // 1. Fetch assigned block details
      const blockRes = await api.getBlockDetails();
      if (blockRes.success) {
        setBlockInfo(blockRes.block);
        setRooms(blockRes.rooms);
        setStudents(blockRes.students);
        
        // Initialize attendance map for marking
        const initialMap = {};
        blockRes.students.forEach(s => {
          initialMap[s.id] = 'present';
        });
        setAttendanceMap(initialMap);
      }

      // 2. Fetch complaints, leaves, and visitors lists (mock fallback for warden scope)
      if (activeTab === 'complaints') {
        setComplaints([
          { id: 1, Student: { User: { name: 'Charlie Brown' } }, type: 'internet', description: 'Wi-Fi keeps disconnecting in room 101.', status: 'pending', createdAt: new Date() },
          { id: 3, Student: { User: { name: 'Emma Watson' } }, type: 'water', description: 'Leakage in bathroom faucet.', status: 'in_progress', assignedStaff: 'Plumber Mario', resolutionNotes: '', createdAt: new Date() }
        ]);
      } else if (activeTab === 'leaves') {
        setLeaves([
          { id: 1, Student: { User: { name: 'Alice Cooper' }, registerNumber: 'REG2026001' }, startDate: '2026-07-10', endDate: '2026-07-12', reason: "Sister's wedding.", status: 'approved' },
          { id: 2, Student: { User: { name: 'Charlie Brown' }, registerNumber: 'REG2026002' }, startDate: '2026-07-15', endDate: '2026-07-20', reason: 'Family medical emergency.', status: 'pending' }
        ]);
      } else if (activeTab === 'visitors') {
        setVisitors([
          { id: 1, visitorName: 'John Cooper', relationship: 'Father', mobileNumber: '9876543211', Student: { User: { name: 'Alice Cooper' } }, entryTime: new Date(Date.now() - 172800000), exitTime: new Date(Date.now() - 165600000) },
          { id: 2, visitorName: 'Lucy Brown', relationship: 'Sister', mobileNumber: '9876543222', Student: { User: { name: 'Charlie Brown' } }, entryTime: new Date(Date.now() - 86400000), exitTime: new Date(Date.now() - 82800000) },
          { id: 3, visitorName: 'Alex Mercer', relationship: 'Friend', mobileNumber: '9876543299', Student: { User: { name: 'David Beckham' } }, entryTime: new Date(), exitTime: null }
        ]);
      }
    } catch (err) {
      toast.error('Failed to load warden details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Attendancemarking action
  const handleSaveAttendance = async () => {
    const attendanceRecords = Object.keys(attendanceMap).map(studentId => ({
      studentId: parseInt(studentId),
      status: attendanceMap[studentId]
    }));

    try {
      const res = await api.markAttendance({
        date: attendanceDate,
        attendanceRecords
      });
      if (res.success) {
        toast.success('Attendance saved successfully');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Leave Approvals
  const handleReviewLeave = async (id, status) => {
    try {
      const res = await api.reviewLeave(id, { status });
      if (res.success) {
        toast.success(`Leave request ${status}`);
        fetchWardenData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Complaint updates
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateComplaint(editingItem.id, formData);
      if (res.success) {
        toast.success('Complaint status updated');
        setModalOpen(false);
        fetchWardenData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Visitors logging
  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addVisitor(formData);
      if (res.success) {
        toast.success('Visitor entry registered');
        setModalOpen(false);
        fetchWardenData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleVisitorCheckout = async (id) => {
    try {
      const res = await api.checkoutVisitor(id);
      if (res.success) {
        toast.success('Visitor checkout completed');
        fetchWardenData();
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

      {/* --- DASHBOARD TAB --- */}
      {!loading && activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Warden Dashboard</h3>
              <p className="text-xs text-slate-400">Hostel Block: {blockInfo?.name || 'Loading Block...'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Block Residents" value={students.length} icon={Users} color="blue" description="Students residing in block" />
            <StatCard title="Rooms Managed" value={rooms.length} icon={Hotel} color="teal" description={`${blockInfo?.floors || 0} Floors total`} />
            <StatCard title="Active Alerts" value={2} icon={ShieldAlert} color="rose" description="Pending tasks" />
          </div>

          {/* Block residents list summary */}
          <div className="glass-card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Assigned Block Residents</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Register Number</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Year</th>
                    <th className="pb-3">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {students.map(s => (
                    <tr key={s.id} className="text-slate-700 dark:text-slate-350">
                      <td className="py-3 font-semibold text-slate-850 dark:text-white">{s.User?.name}</td>
                      <td>{s.registerNumber}</td>
                      <td className="capitalize">{s.department}</td>
                      <td>Yr {s.year}</td>
                      <td>{s.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- BLOCK ROOMS TAB --- */}
      {!loading && activeTab === 'my-block' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Block Room Occupancies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => {
              const bedsLeft = room.capacity - room.occupancy;
              let indicator = 'border-teal-200 bg-teal-50/20 text-teal-600';
              if (bedsLeft === 0) indicator = 'border-rose-200 bg-rose-50/20 text-rose-600';
              else if (bedsLeft === 1) indicator = 'border-orange-200 bg-orange-50/20 text-orange-600';
              
              return (
                <div key={room.id} className={`p-6 border rounded-2xl ${indicator} space-y-4`}>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-base">Room {room.roomNumber}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wide">Floor {room.floor}</span>
                  </div>
                  <div className="text-xs">
                    Occupancy: {room.occupancy} / {room.capacity} beds taken
                  </div>
                  {/* Occupants list */}
                  {room.RoomAllocations?.length > 0 && (
                    <div className="border-t pt-3 mt-3 border-slate-100/50 space-y-1">
                      <p className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Current Occupants:</p>
                      {room.RoomAllocations.map(alloc => (
                        <div key={alloc.id} className="text-[10px] text-slate-600 dark:text-slate-400">
                          • {alloc.Student?.User?.name} ({alloc.Student?.department})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- ATTENDANCE MARKING TAB --- */}
      {!loading && activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Daily Attendance Marking</h3>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="form-input text-xs w-36"
              />
              <button onClick={handleSaveAttendance} className="btn-primary py-2 px-6">Save Attendance</button>
            </div>
          </div>

          <div className="glass-card overflow-x-auto p-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Register Number</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="p-4 font-semibold text-slate-850 dark:text-white">{student.User?.name}</td>
                    <td className="p-4">{student.registerNumber}</td>
                    <td className="p-4 flex gap-4 justify-center">
                      {['present', 'absent', 'leave'].map((status) => (
                        <label key={status} className="flex items-center gap-1.5 cursor-pointer capitalize font-medium">
                          <input
                            type="radio"
                            name={`attn_${student.id}`}
                            value={status}
                            checked={attendanceMap[student.id] === status}
                            onChange={() => setAttendanceMap({ ...attendanceMap, [student.id]: status })}
                            className="text-primary focus:ring-primary"
                          />
                          {status}
                        </label>
                      ))}
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
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Block Complaints</h3>
          <div className="space-y-4">
            {complaints.map(comp => (
              <div key={comp.id} className="glass-card p-6 flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold uppercase text-[9px]">
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
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Resident: {comp.Student?.User?.name}</h4>
                  <p className="text-xs text-slate-500 leading-normal">{comp.description}</p>
                  
                  {comp.assignedStaff && (
                    <div className="text-[10px] text-slate-400">
                      Assigned: <span className="font-semibold">{comp.assignedStaff}</span>
                      {comp.resolutionNotes && <span> | Note: {comp.resolutionNotes}</span>}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingItem(comp);
                    setFormData({ status: comp.status, assignedStaff: comp.assignedStaff || '', resolutionNotes: comp.resolutionNotes || '' });
                    setModalType('complaint');
                    setModalOpen(true);
                  }}
                  className="btn-outline py-1.5 px-3 flex gap-1 items-center"
                >
                  <Edit className="w-3.5 h-3.5" /> Manage Ticket
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- LEAVES TAB --- */}
      {!loading && activeTab === 'leaves' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Leaves Application Approvals</h3>
          <div className="glass-card overflow-x-auto p-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="p-4 font-semibold text-slate-850 dark:text-white">{leave.Student?.User?.name}</td>
                    <td className="p-4">{leave.startDate} to {leave.endDate}</td>
                    <td className="p-4">{leave.reason}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        leave.status === 'approved' ? 'bg-teal-50 text-teal-600' :
                        leave.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      {leave.status === 'pending' ? (
                        <>
                          <button onClick={() => handleReviewLeave(leave.id, 'approved')} className="p-1 bg-teal-50 text-teal-600 rounded"><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleReviewLeave(leave.id, 'rejected')} className="p-1 bg-rose-50 text-rose-600 rounded"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 capitalize">{leave.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- VISITORS LOG TAB --- */}
      {!loading && activeTab === 'visitors' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Visitor Checking Logs</h3>
            <button
              onClick={() => {
                setFormData({ studentId: students[0]?.id || 1 });
                setModalType('visitor');
                setModalOpen(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> Check In Visitor
            </button>
          </div>

          <div className="glass-card overflow-x-auto p-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Visitor</th>
                  <th className="p-4">Relation</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Host Student</th>
                  <th className="p-4">Entry Time</th>
                  <th className="p-4">Exit Time</th>
                  <th className="p-4 text-center">Checkout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {visitors.map((visitor) => (
                  <tr key={visitor.id}>
                    <td className="p-4 font-semibold text-slate-800 dark:text-white">{visitor.visitorName}</td>
                    <td className="p-4">{visitor.relationship}</td>
                    <td className="p-4">{visitor.mobileNumber}</td>
                    <td className="p-4">{visitor.Student?.User?.name}</td>
                    <td className="p-4">{new Date(visitor.entryTime).toLocaleString()}</td>
                    <td className="p-4">{visitor.exitTime ? new Date(visitor.exitTime).toLocaleString() : 'Active inside'}</td>
                    <td className="p-4 text-center">
                      {!visitor.exitTime ? (
                        <button
                          onClick={() => handleVisitorCheckout(visitor.id)}
                          className="px-2.5 py-1 text-[10px] bg-rose-50 text-rose-500 rounded font-bold hover:bg-rose-100"
                        >
                          Checkout
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- FORM MODAL DIALOGS --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700/60 space-y-6">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-white capitalize">
                Manage {modalType}
              </h4>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {/* Log Visitor Form */}
            {modalType === 'visitor' && (
              <form onSubmit={handleVisitorSubmit} className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Visitor Full Name"
                    value={formData.visitorName || ''}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Relationship (e.g. Father, Sister)"
                    value={formData.relationship || ''}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Visitor Mobile No"
                    value={formData.mobileNumber || ''}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="form-input"
                  />
                  
                  <label className="text-[10px] uppercase font-bold text-slate-400">Host student in Block</label>
                  <select
                    value={formData.studentId || ''}
                    onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                    className="form-input"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.User?.name} ({s.registerNumber})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">Check In Visitor</button>
              </form>
            )}

            {/* Edit Complaint Ticket Status Form */}
            {modalType === 'complaint' && (
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-slate-450 block">Status</label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  
                  <label className="text-[10px] uppercase font-bold text-slate-450 block mt-2">Assigned Service Staff</label>
                  <input
                    type="text"
                    placeholder="e.g. Carpenter Mark, Plumber Mario"
                    value={formData.assignedStaff || ''}
                    onChange={(e) => setFormData({ ...formData, assignedStaff: e.target.value })}
                    className="form-input"
                  />
                  
                  <label className="text-[10px] uppercase font-bold text-slate-450 block mt-2">Resolution details/notes</label>
                  <textarea
                    placeholder="Resolution details notes"
                    value={formData.resolutionNotes || ''}
                    onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                    className="form-input min-h-[80px]"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">Update Ticket</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WardenDashboard;
