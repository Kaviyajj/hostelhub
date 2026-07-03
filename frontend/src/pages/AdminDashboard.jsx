import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { OccupancyDonut, FeeCollectionChart, ComplaintsDistribution } from '../components/AnalyticsCharts';
import {
  Users, UserCog, Hotel, ShieldAlert, CalendarCheck,
  ClipboardList, BookOpen, BellRing, FileSpreadsheet, Database,
  Plus, Edit, Trash2, Check, X, ArrowUpRight, Download, Upload, Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [notices, setNotices] = useState([]);
  const [visitors, setVisitors] = useState([]);
  
  // Loading and Modals states
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'student', 'warden', 'block', 'room', 'allocation'
  const [editingItem, setEditingItem] = useState(null);

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('');
  const [studentYearFilter, setStudentYearFilter] = useState('');

  // Form Fields States
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await api.getStats();
        if (res.success) {
          setStats(res.stats);
          setActivities(res.recentActivities);
        }
      } else if (activeTab === 'students') {
        const res = await api.getStudents({ search: studentSearch, dept: studentDeptFilter, year: studentYearFilter });
        if (res.success) setStudents(res.students);
      } else if (activeTab === 'wardens') {
        const res = await api.getWardens();
        const blockRes = await api.getBlocks();
        if (res.success) setWardens(res.wardens);
        if (blockRes.success) setBlocks(blockRes.blocks);
      } else if (activeTab === 'rooms') {
        const bRes = await api.getBlocks();
        const rRes = await api.getRooms();
        const sRes = await api.getStudents({ status: 'approved' });
        if (bRes.success) setBlocks(bRes.blocks);
        if (rRes.success) setRooms(rRes.rooms);
        if (sRes.success) setStudents(sRes.students);
      } else if (activeTab === 'complaints') {
        // Fetch all student complaints (use student complaints or fallback to seed list)
        const res = await api.getStudents();
        let allComplaints = [];
        // Read complaints list or simulate fetching complaints
        const noticeRes = await api.getNotices(); // simple placeholder to query
        // Let's query student details
        const rRes = await api.getRooms(); // simple fetch
        // For complaints list we can fetch from student accounts or simulate
        setComplaints([
          { id: 1, Student: { User: { name: 'Charlie Brown' } }, type: 'internet', description: 'Wi-Fi keeps disconnecting in room 101.', status: 'pending', createdAt: new Date() },
          { id: 2, Student: { User: { name: 'Alice Cooper' } }, type: 'furniture', description: 'The study chair has a broken leg.', status: 'resolved', assignedStaff: 'Carpenter Mark', resolutionNotes: 'Replaced study chair.', createdAt: new Date() },
          { id: 3, Student: { User: { name: 'Emma Watson' } }, type: 'water', description: 'Leakage in bathroom faucet.', status: 'in_progress', assignedStaff: 'Plumber Mario', resolutionNotes: '', createdAt: new Date() }
        ]);
      } else if (activeTab === 'leaves') {
        // Fetch leave requests (mock list loaded for admin approvals)
        setLeaves([
          { id: 1, Student: { User: { name: 'Alice Cooper' }, registerNumber: 'REG2026001' }, startDate: '2026-07-10', endDate: '2026-07-12', reason: "Sister's wedding.", status: 'approved' },
          { id: 2, Student: { User: { name: 'Charlie Brown' }, registerNumber: 'REG2026002' }, startDate: '2026-07-15', endDate: '2026-07-20', reason: 'Family medical emergency.', status: 'pending' },
          { id: 3, Student: { User: { name: 'David Beckham' }, registerNumber: 'REG2026004' }, startDate: '2026-06-25', endDate: '2026-06-28', reason: 'Sports event.', status: 'rejected' }
        ]);
      } else if (activeTab === 'notices') {
        const res = await api.getNotices();
        if (res.success) setNotices(res.notices);
      } else if (activeTab === 'visitors') {
        // Mock visitors logs
        setVisitors([
          { id: 1, visitorName: 'John Cooper', relationship: 'Father', mobileNumber: '9876543211', Student: { User: { name: 'Alice Cooper' } }, entryTime: new Date(Date.now() - 172800000), exitTime: new Date(Date.now() - 165600000) },
          { id: 2, visitorName: 'Lucy Brown', relationship: 'Sister', mobileNumber: '9876543222', Student: { User: { name: 'Charlie Brown' } }, entryTime: new Date(Date.now() - 86400000), exitTime: new Date(Date.now() - 82800000) },
          { id: 3, visitorName: 'Alex Mercer', relationship: 'Friend', mobileNumber: '9876543299', Student: { User: { name: 'David Beckham' } }, entryTime: new Date(), exitTime: null }
        ]);
      } else if (activeTab === 'fees') {
        // Mock fees structures
        setBlocks([
          { id: 1, name: 'Alice Cooper', reg: 'REG2026001', year: '2025-2026', total: 80000, paid: 80000, status: 'paid' },
          { id: 2, name: 'Charlie Brown', reg: 'REG2026002', year: '2025-2026', total: 80000, paid: 0, status: 'pending' },
          { id: 3, name: 'Emma Watson', reg: 'REG2026003', year: '2025-2026', total: 80000, paid: 40000, status: 'partially_paid' }
        ]);
      }
    } catch (err) {
      toast.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Student Actions
  const handleAddEditStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await api.updateStudent(editingItem.id, formData);
        if (res.success) toast.success('Student updated successfully');
      } else {
        const res = await api.addStudent(formData);
        if (res.success) toast.success('Student added successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const res = await api.deleteStudent(id);
        if (res.success) {
          toast.success('Student record deleted');
          fetchData();
        }
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handleApproveAdmission = async (student, status) => {
    try {
      const res = await api.updateStudent(student.id, { admissionStatus: status });
      if (res.success) {
        toast.success(`Application ${status} successfully`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Warden Actions
  const handleWardenSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await api.updateWarden(editingItem.id, formData);
        if (res.success) toast.success('Warden updated successfully');
      } else {
        const res = await api.addWarden(formData);
        if (res.success) toast.success('Warden added successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteWarden = async (id) => {
    if (window.confirm('Delete this warden?')) {
      try {
        await api.deleteWarden(id);
        toast.success('Warden deleted successfully');
        fetchData();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  // Room Actions
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addRoom(formData);
      if (res.success) {
        toast.success('Room created successfully');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addBlock(formData);
      if (res.success) {
        toast.success('Block created successfully');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAllocationSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.allocateRoom(formData);
      if (res.success) {
        toast.success('Room allocated successfully');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleVacateRoom = async (studentId) => {
    if (window.confirm('Vacate room for this student?')) {
      try {
        const res = await api.vacateRoom({ studentId });
        if (res.success) {
          toast.success('Room vacated');
          fetchData();
        }
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  // Notice Board Actions
  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    const noticeForm = new FormData();
    noticeForm.append('title', formData.title);
    noticeForm.append('description', formData.description);
    noticeForm.append('category', formData.category || 'general');
    
    // Check if pdf uploader file exists
    const fileInput = document.getElementById('noticeFile');
    if (fileInput && fileInput.files[0]) {
      noticeForm.append('pdf', fileInput.files[0]);
    }

    try {
      const res = await api.createNotice(noticeForm);
      if (res.success) {
        toast.success('Notice published successfully');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (window.confirm('Delete this notice?')) {
      try {
        await api.deleteNotice(id);
        toast.success('Notice deleted');
        fetchData();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  // DB Backup & Restore
  const handleBackup = async () => {
    try {
      const blob = await api.backupDb();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hostelhub_db_backup.json');
      document.body.appendChild(link);
      link.click();
      toast.success('Backup file downloaded successfully');
    } catch (err) {
      toast.error('Backup failed: ' + err.message);
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const backupData = JSON.parse(evt.target.result);
        const res = await api.restoreDb(backupData);
        if (res.success) {
          toast.success('Database restored successfully from backup!');
          fetchData();
        }
      } catch (err) {
        toast.error('Failed to restore: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && activeTab === 'dashboard' && stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="blue" description="Enrolled Residents" />
            <StatCard title="Occupied Beds" value={stats.occupiedBeds} icon={Hotel} color="teal" description={`Out of ${stats.totalCapacity} total`} />
            <StatCard title="Available Beds" value={stats.availableBeds} icon={Hotel} color="orange" description="Ready for occupancy" />
            <StatCard title="Pending complaints" value={stats.pendingComplaints} icon={ShieldAlert} color="rose" description="Requires attention" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <OccupancyDonut occupied={stats.occupiedBeds} capacity={stats.totalCapacity} />
            </div>
            <div className="lg:col-span-1">
              <FeeCollectionChart collectionData={[12000, 24000, 18000, 35000, 28000, stats.totalFeeCollected]} />
            </div>
            <div className="lg:col-span-1">
              <ComplaintsDistribution complaints={[]} /> {/* Empty array for fallback progress bars */}
            </div>
          </div>

          {/* Activities list */}
          <div className="glass-card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Recent Activity Logs</h4>
            <div className="space-y-4">
              {activities.map((log) => (
                <div key={log.id} className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-800/40 text-xs">
                  <div className="flex gap-3 items-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold uppercase text-[9px] text-slate-600 dark:text-slate-400">
                      {log.action}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">{log.details}</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* --- STUDENTS TAB --- */}
      {!loading && activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Resident Management</h3>
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({ gender: 'male', year: 1 });
                setModalType('student');
                setModalOpen(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 glass-card p-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Dept Filter (CS/ME)"
              value={studentDeptFilter}
              onChange={(e) => setStudentDeptFilter(e.target.value)}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Year Filter"
              value={studentYearFilter}
              onChange={(e) => setStudentYearFilter(e.target.value)}
              className="form-input"
            />
            <button onClick={fetchData} className="btn-secondary">Apply Filters</button>
          </div>

          {/* Students table */}
          <div className="glass-card overflow-x-auto p-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Reg No</th>
                  <th className="p-4">Dept / Year</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Room</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-4 font-semibold text-slate-850 dark:text-white">{student.User?.name}</td>
                    <td className="p-4">{student.registerNumber}</td>
                    <td className="p-4 capitalize">{student.department} (Yr {student.year})</td>
                    <td className="p-4">{student.phone}</td>
                    <td className="p-4">
                      {student.RoomAllocations?.length > 0
                        ? `${student.RoomAllocations[0].Room.Block.name} - Rm ${student.RoomAllocations[0].Room.roomNumber}`
                        : 'Unassigned'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        student.admissionStatus === 'approved' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20' :
                        student.admissionStatus === 'pending' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {student.admissionStatus}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      {student.admissionStatus === 'pending' && (
                        <>
                          <button onClick={() => handleApproveAdmission(student, 'approved')} className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100" title="Approve"><Check className="w-4 h-4" /></button>
                          <button onClick={() => handleApproveAdmission(student, 'rejected')} className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100" title="Reject"><X className="w-4 h-4" /></button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setEditingItem(student);
                          setFormData({
                            name: student.User?.name,
                            email: student.User?.email,
                            department: student.department,
                            year: student.year,
                            phone: student.phone,
                            parentName: student.parentName,
                            parentPhone: student.parentPhone,
                            address: student.address
                          });
                          setModalType('student');
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteStudent(student.id)} className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- WARDENS TAB --- */}
      {!loading && activeTab === 'wardens' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Hostel Wardens</h3>
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({});
                setModalType('warden');
                setModalOpen(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> Add Warden
            </button>
          </div>

          <div className="glass-card overflow-x-auto p-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Contact No</th>
                  <th className="p-4">Assigned Block</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {wardens.map((warden) => (
                  <tr key={warden.id}>
                    <td className="p-4 font-semibold text-slate-800 dark:text-white">{warden.User?.name}</td>
                    <td className="p-4">{warden.User?.email}</td>
                    <td className="p-4">{warden.phone}</td>
                    <td className="p-4">{warden.AssignedBlock?.name || 'Unassigned'}</td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setEditingItem(warden);
                          setFormData({
                            name: warden.User?.name,
                            email: warden.User?.email,
                            phone: warden.phone,
                            assignedBlockId: warden.assignedBlockId
                          });
                          setModalType('warden');
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteWarden(warden.id)} className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ROOMS & BLOCKS TAB --- */}
      {!loading && activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Blocks & Rooms</h3>
            <div className="flex gap-3">
              <button onClick={() => { setFormData({}); setModalType('block'); setModalOpen(true); }} className="btn-outline"><Plus className="w-4 h-4" /> Add Block</button>
              <button onClick={() => { setFormData({ blockId: blocks[0]?.id || 1, capacity: 4 }); setModalType('room'); setModalOpen(true); }} className="btn-primary"><Plus className="w-4 h-4" /> Add Room</button>
              <button onClick={() => { setFormData({ studentId: students[0]?.id || 1, roomId: rooms[0]?.id || 1 }); setModalType('allocation'); setModalOpen(true); }} className="btn-secondary"><Plus className="w-4 h-4" /> Allocate Room</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rooms List */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 dark:text-white">Active Rooms</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => {
                  const availabilityRatio = room.occupancy / room.capacity;
                  let colorClass = 'border-teal-200 bg-teal-50/30 text-teal-700'; // Green = Available
                  if (availabilityRatio >= 1) {
                    colorClass = 'border-rose-200 bg-rose-50/30 text-rose-700'; // Red = Full
                  } else if (availabilityRatio >= 0.7) {
                    colorClass = 'border-orange-200 bg-orange-50/30 text-orange-700'; // Yellow = Nearly Full
                  }
                  
                  return (
                    <div key={room.id} className={`p-5 rounded-2xl border ${colorClass} space-y-3`}>
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-base">Room {room.roomNumber}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">{room.Block?.name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Beds: {room.occupancy} / {room.capacity} occupied</span>
                        <span className="capitalize">Floor: {room.floor}</span>
                      </div>
                      {/* Occupant details */}
                      {room.RoomAllocations?.length > 0 && (
                        <div className="border-t pt-2 mt-2 border-slate-100 space-y-1">
                          <p className="text-[9px] uppercase font-bold tracking-wide text-slate-400">Current Occupants:</p>
                          {room.RoomAllocations.map(alloc => (
                            <div key={alloc.id} className="flex justify-between items-center text-[10px] text-slate-600 dark:text-slate-400">
                              <span>• {alloc.Student?.User?.name}</span>
                              <button onClick={() => handleVacateRoom(alloc.studentId)} className="text-rose-500 hover:underline">Vacate</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blocks info */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 dark:text-white">Hostel Blocks</h4>
              <div className="space-y-3">
                {blocks.map(b => (
                  <div key={b.id} className="glass-card p-4 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-white text-xs">{b.name}</h5>
                      <p className="text-[10px] text-slate-400">{b.floors} Floors | {b.Rooms?.length || 0} Rooms total</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400">
                      Block ID: {b.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NOTICES BOARD TAB --- */}
      {!loading && activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Notice Board Announcements</h3>
            <button onClick={() => { setFormData({ category: 'general' }); setModalType('notice'); setModalOpen(true); }} className="btn-primary">
              <Plus className="w-4 h-4" /> Publish Announcement
            </button>
          </div>

          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="glass-card p-6 flex justify-between items-start">
                <div className="space-y-2 flex-1">
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
                      <Download className="w-4 h-4" /> View PDF Document
                    </a>
                  )}
                </div>
                <button onClick={() => handleDeleteNotice(notice.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500">
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- LEAVES TAB --- */}
      {!loading && activeTab === 'leaves' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Student Leave Requests</h3>
          <div className="glass-card overflow-x-auto p-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Reg No</th>
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
                    <td className="p-4">{leave.Student?.registerNumber}</td>
                    <td className="p-4">{leave.startDate} to {leave.endDate}</td>
                    <td className="p-4">{leave.reason}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                        leave.status === 'approved' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20' :
                        leave.status === 'pending' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      {leave.status === 'pending' ? (
                        <>
                          <button onClick={async () => { await api.reviewLeave(leave.id, { status: 'approved' }); toast.success('Approved'); fetchData(); }} className="p-1 bg-teal-50 text-teal-600 rounded"><Check className="w-4 h-4" /></button>
                          <button onClick={async () => { await api.reviewLeave(leave.id, { status: 'rejected' }); toast.success('Rejected'); fetchData(); }} className="p-1 bg-rose-50 text-rose-600 rounded"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- REPORTS TAB --- */}
      {!loading && activeTab === 'reports' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Export & Download Reports</h3>
          <p className="text-sm text-slate-400">Generate downloadable reports in Excel-compatible CSV formats containing all records.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { type: 'students', label: 'Student Enrolments Report', desc: 'Active records, parent details, addresses, and status.' },
              { type: 'rooms', label: 'Room Occupancy Ledger', desc: 'Room capacities, blocks summary, and available beds.' },
              { type: 'fees', label: 'Financial Fee Payments', desc: 'Paid, pending, and partially paid student balances.' },
              { type: 'attendance', label: 'Daily Attendance History', desc: 'Daily logs of student presence and leave statistics.' },
              { type: 'complaints', label: 'Complaints & Resolution Log', desc: 'All tickets, categorizations, and staff comments.' },
              { type: 'leaves', label: 'Student Leave Records', desc: 'Student leaves durations, reasons, and warden review status.' }
            ].map((rep, idx) => (
              <div key={idx} className="glass-card p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">{rep.label}</h4>
                  <p className="text-xs text-slate-400 leading-normal">{rep.desc}</p>
                </div>
                <a
                  href={api.getReportCsvUrl(rep.type)}
                  download
                  className="btn-primary py-2.5 w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download CSV (Excel)
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SYSTEM UTILITIES (BACKUP/RESTORE) --- */}
      {!loading && activeTab === 'backup' && (
        <div className="space-y-6 max-w-xl">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Database Backup & Restore</h3>
          <p className="text-sm text-slate-400 leading-normal">Maintain and backup HostelHub database. Exports a single JSON file that can rebuild the entire system database dialetically on SQLite or MySQL.</p>

          <div className="space-y-4">
            <div className="glass-card p-6 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Backup</h4>
                <p className="text-xs text-slate-500 mt-1">Download backup schema and seed datasets.</p>
              </div>
              <button onClick={handleBackup} className="btn-primary">
                <Download className="w-4.5 h-4.5" /> Export Data JSON
              </button>
            </div>

            <div className="glass-card p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Database Restore</h4>
                <p className="text-xs text-slate-500 mt-1">Select a previously exported JSON backup file to overwrite current data tables.</p>
              </div>
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                <span className="text-xs text-slate-500 mt-2">Click to select backup file</span>
                <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* --- FORM MODAL DIALOGS --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700/60 space-y-6">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-white capitalize">
                {editingItem ? 'Edit ' : 'Add '} {modalType}
              </h4>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {/* Student Add/Edit Form */}
            {modalType === 'student' && (
              <form onSubmit={handleAddEditStudent} className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                    />
                    {!editingItem && (
                      <input
                        type="password"
                        required
                        placeholder="Password"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="form-input"
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Dept"
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="form-input col-span-1"
                    />
                    <select
                      value={formData.year || '1'}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="form-input col-span-1"
                    >
                      <option value="1">1st Yr</option>
                      <option value="2">2nd Yr</option>
                      <option value="3">3rd Yr</option>
                      <option value="4">4th Yr</option>
                    </select>
                    <select
                      value={formData.gender || 'female'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="form-input col-span-1"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">Save Changes</button>
              </form>
            )}

            {/* Warden Add/Edit Form */}
            {modalType === 'warden' && (
              <form onSubmit={handleWardenSubmit} className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Warden Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Warden Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                  {!editingItem && (
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="form-input"
                    />
                  )}
                  <input
                    type="text"
                    required
                    placeholder="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                  <select
                    value={formData.assignedBlockId || ''}
                    onChange={(e) => setFormData({ ...formData, assignedBlockId: e.target.value ? parseInt(e.target.value) : '' })}
                    className="form-input"
                  >
                    <option value="">No Block Assigned</option>
                    {blocks.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">Save Warden</button>
              </form>
            )}

            {/* Block Add Form */}
            {modalType === 'block' && (
              <form onSubmit={handleBlockSubmit} className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Block Name (e.g. A Block)"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Number of Floors"
                    value={formData.floors || ''}
                    onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">Create Block</button>
              </form>
            )}

            {/* Room Add Form */}
            {modalType === 'room' && (
              <form onSubmit={handleRoomSubmit} className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Room Number"
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="form-input"
                  />
                  <select
                    value={formData.blockId || ''}
                    onChange={(e) => setFormData({ ...formData, blockId: parseInt(e.target.value) })}
                    className="form-input"
                  >
                    {blocks.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Floor"
                    value={formData.floor || ''}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                    className="form-input"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Beds Capacity"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="form-input"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">Create Room</button>
              </form>
            )}

            {/* Allocate Room Form */}
            {modalType === 'allocation' && (
              <form onSubmit={handleAllocationSubmit} className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Select Student</label>
                  <select
                    value={formData.studentId || ''}
                    onChange={(e) => setFormData({ ...formData, studentId: parseInt(e.target.value) })}
                    className="form-input"
                  >
                    {students.filter(s => s.admissionStatus === 'approved').map(s => (
                      <option key={s.id} value={s.id}>{s.User?.name} ({s.registerNumber})</option>
                    ))}
                  </select>
                  
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mt-2">Select Target Room</label>
                  <select
                    value={formData.roomId || ''}
                    onChange={(e) => setFormData({ ...formData, roomId: parseInt(e.target.value) })}
                    className="form-input"
                  >
                    {rooms.filter(r => r.status === 'active' && r.occupancy < r.capacity).map(r => (
                      <option key={r.id} value={r.id}>
                        {r.Block?.name} - Rm {r.roomNumber} ({r.capacity - r.occupancy} beds free)
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">Allocate Bed</button>
              </form>
            )}

            {/* Publish Notice Announcement */}
            {modalType === 'notice' && (
              <form onSubmit={handleNoticeSubmit} className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Notice Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                  <select
                    value={formData.category || 'general'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                  >
                    <option value="general">General</option>
                    <option value="mess">Mess</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="sports">Sports & Events</option>
                  </select>
                  <textarea
                    required
                    placeholder="Description / Notice details"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input min-h-[100px]"
                  />
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Attach Document (PDF)</label>
                    <input type="file" id="noticeFile" accept="application/pdf" className="form-input text-xs" />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-2.5">Publish Notice</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
