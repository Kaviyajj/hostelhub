const API_BASE_URL = 'http://localhost:5000/api';

// Create API helpers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Something went wrong');
  }
  return response.json();
};

const api = {
  // --- AUTH SERVICES ---
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  register: async (studentData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  changePassword: async (passwords) => {
    const response = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(passwords)
    });
    return handleResponse(response);
  },

  uploadAvatar: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData // Must NOT specify Content-Type; browser sets multipart/form-data boundary
    });
    return handleResponse(response);
  },

  // --- ADMIN SERVICES ---
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getStudents: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/students?${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  addStudent: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateStudent: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteStudent: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getWardens: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/wardens`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  addWarden: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/wardens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateWarden: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/wardens/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteWarden: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/wardens/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getBlocks: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/blocks`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  addBlock: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getRooms: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  addRoom: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateRoom: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteRoom: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  allocateRoom: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  vacateRoom: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/vacate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  backupDb: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/backup`, {
      headers: getAuthHeaders()
    });
    return response.blob(); // Returns file data directly
  },

  restoreDb: async (backupData) => {
    const response = await fetch(`${API_BASE_URL}/admin/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(backupData)
    });
    return handleResponse(response);
  },

  // --- WARDEN SERVICES ---
  getBlockDetails: async () => {
    const response = await fetch(`${API_BASE_URL}/warden/block`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markAttendance: async (data) => {
    const response = await fetch(`${API_BASE_URL}/warden/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  reviewLeave: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/warden/leave/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateComplaint: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/warden/complaint/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  addVisitor: async (data) => {
    const response = await fetch(`${API_BASE_URL}/warden/visitor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  checkoutVisitor: async (id) => {
    const response = await fetch(`${API_BASE_URL}/warden/visitor/${id}/checkout`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // --- STUDENT SERVICES ---
  getStudentDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/student/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  applyLeave: async (data) => {
    const response = await fetch(`${API_BASE_URL}/student/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getStudentLeaves: async () => {
    const response = await fetch(`${API_BASE_URL}/student/leave`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  fileComplaint: async (data) => {
    const response = await fetch(`${API_BASE_URL}/student/complaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getStudentComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}/student/complaint`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getStudentFees: async () => {
    const response = await fetch(`${API_BASE_URL}/student/fees`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  payFees: async (data) => {
    const response = await fetch(`${API_BASE_URL}/student/fees/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/student/notifications`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markNotificationRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/student/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // --- SHARED SERVICES ---
  getNotices: async () => {
    const response = await fetch(`${API_BASE_URL}/shared/notices`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createNotice: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/shared/notices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData // multipart/form-data
    });
    return handleResponse(response);
  },

  deleteNotice: async (id) => {
    const response = await fetch(`${API_BASE_URL}/shared/notices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getReceiptDownloadUrl: (paymentId) => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/shared/receipts/${paymentId}?token=${token}`; // Token query for standalone links
  },

  getReportCsvUrl: (reportType) => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/shared/reports?type=${reportType}&token=${token}`;
  }
};

export default api;
export { API_BASE_URL, getAuthHeaders };
