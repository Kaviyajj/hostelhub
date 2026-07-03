import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, ShieldAlert, Sparkles, KeyRound, Mail, User, Phone, MapPin, ClipboardList, Info } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [gender, setGender] = useState('male');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('1');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please enter email and password');
    }
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
      } else {
        toast.error(res.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !registerNumber || !department || !phone || !parentName || !parentPhone || !address) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        registerNumber,
        gender,
        department,
        year: parseInt(year),
        phone,
        parentName,
        parentPhone,
        address
      });

      if (res.success) {
        toast.success('Registration request submitted! Wait for admin approval.');
        setIsLogin(true);
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      {/* Visual background decorations */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 glass-card border border-slate-100 dark:border-slate-800 shadow-xl relative z-10 p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
            HH
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {isLogin ? 'Welcome back' : 'Hostel Admission'}
          </h2>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-400 font-medium">
            {isLogin ? 'Manage and access your hostel records easily' : 'Register your details to apply for admission'}
          </p>
        </div>

        {isLogin ? (
          /* Login Form */
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-11"
                  placeholder="Email address"
                />
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-11"
                  placeholder="Password"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-slate-500 dark:text-slate-400">
                  Remember me
                </label>
              </div>

              <a href="#" onClick={(e) => { e.preventDefault(); toast.info('Default credentials: admin@hostelhub.com / adminpassword, sarah.warden@hostelhub.com / wardenpassword, alice@hostelhub.com / studentpassword'); }} className="text-primary hover:text-primary-hover transition-colors">
                Forgot password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3"
              >
                {loading ? 'Signing in...' : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form className="mt-8 space-y-4 max-h-[480px] overflow-y-auto pr-1" onSubmit={handleRegisterSubmit}>
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block">Personal Details</span>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="form-input pl-10"
                  placeholder="Full Name"
                />
                <User className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Email Address"
                  />
                  <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Password"
                  />
                  <KeyRound className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="form-input"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  placeholder="Student Phone"
                />
              </div>

              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block pt-2">Academic Details</span>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  className="form-input col-span-1"
                  placeholder="Reg No"
                />
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="form-input col-span-1"
                  placeholder="Dept (CS/ME)"
                />
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="form-input col-span-1"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block pt-2">Parent & Address Details</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="form-input"
                  placeholder="Parent/Guardian Name"
                />
                <input
                  type="text"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="form-input"
                  placeholder="Parent Phone"
                />
              </div>

              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input min-h-[60px]"
                placeholder="Full Correspondence Address"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-secondary py-3 mt-4"
              >
                {loading ? 'Submitting Application...' : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Submit Admission Application
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Toggle between Login and Register */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors dark:text-slate-400"
          >
            {isLogin ? "Don't have an account? Apply for Admission" : "Already applied? Go to Sign In"}
          </button>
        </div>

        {/* Helper Note for testing */}
        {isLogin && (
          <div className="mt-4 p-3 bg-blue-50/50 dark:bg-slate-800/40 rounded-xl flex gap-2 items-start border border-blue-100/50 dark:border-slate-700/30">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
              <strong>Testing Accounts:</strong><br />
              • Admin: <code className="text-primary font-bold">admin@hostelhub.com</code> / adminpassword<br />
              • Warden: <code className="text-primary font-bold">sarah.warden@hostelhub.com</code> / wardenpassword<br />
              • Student: <code className="text-primary font-bold">alice@hostelhub.com</code> / studentpassword
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
