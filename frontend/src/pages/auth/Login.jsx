import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { Eye, EyeOff, ShieldCheck, GraduationCap, UserCheck, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.full_name || 'User'}!`);

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'FACULTY') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      const msg = err.message || 'Invalid credentials or account inactive.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div
      className="login-container"
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#F4F4F1',
        overflow: 'hidden',
      }}
    >
      {/* LEFT SECTION (Dark Charcoal) */}
      <div
        className="login-left-panel"
        style={{
          flex: '1.1',
          backgroundColor: '#171717',
          color: '#FFFFFF',
          padding: '4rem 5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage: `radial-gradient(#FFFFFF 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />

        {/* Top Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
          <div
            style={{
              width: 36,
              height: 36,
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#101010',
              fontWeight: 800,
              fontSize: '1.125rem',
            }}
          >
            U
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
              UniGrade
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#858580', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
              University Examination System
            </div>
          </div>
        </div>

        {/* Hero Narrative & Minimal Graphic */}
        <div style={{ zIndex: 1, maxWidth: '520px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: '#242424',
              color: '#EAEAE7',
              fontSize: '0.75rem',
              fontWeight: 500,
              marginBottom: '1.5rem',
              letterSpacing: '0.05em',
            }}
          >
            ACADEMIC INTEGRITY & RELIABILITY
          </div>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 0 1.25rem',
            }}
          >
            Academic records, organized and verified.
          </h1>

          <p style={{ color: '#B8B8B3', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 2.5rem' }}>
            A centralized university grading engine orchestrating course offerings, assessment
            schedules, weighted evaluations, automated SGPA/CGPA calculations, and certified transcript generation.
          </p>

          {/* Minimal Academic Vector Illustration */}
          <div
            style={{
              border: '1px solid #242424',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#101010',
              display: 'flex',
              gap: '1.5rem',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#858580', textTransform: 'uppercase' }}>Formula Engine</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#FFFFFF', marginTop: 4 }}>
                Credit-Weighted SGPA
              </div>
              <div style={{ fontSize: '0.75rem', color: '#B8B8B3', marginTop: 2, fontFamily: 'monospace' }}>
                Σ(Credits × GP) / Σ(Credits)
              </div>
            </div>
            <div style={{ width: '1px', backgroundColor: '#242424' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#858580', textTransform: 'uppercase' }}>Role Security</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#FFFFFF', marginTop: 4 }}>
                3-Tier Authorization
              </div>
              <div style={{ fontSize: '0.75rem', color: '#B8B8B3', marginTop: 2 }}>
                Admin • Faculty • Student
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '0.75rem', color: '#555550', zIndex: 1 }}>
          © {new Date().getFullYear()} UniGrade System • Strict Monochrome Enterprise Interface
        </div>
      </div>

      {/* RIGHT SECTION (Light Form) */}
      <div
        className="login-right-panel"
        style={{
          flex: '0.9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#101010', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
              Sign in to your account
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#555550' }}>
              Enter your university credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                backgroundColor: '#171717',
                color: '#FFFFFF',
                fontSize: '0.8125rem',
                marginBottom: '1.5rem',
                border: '1px solid #555550',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#171717',
                  marginBottom: '0.375rem',
                }}
              >
                Institutional Email or ID
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@unigrade.edu"
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  border: '1px solid #D8D8D4',
                  backgroundColor: '#FFFFFF',
                  color: '#101010',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#171717' }}>
                  Password
                </label>
                <span style={{ fontSize: '0.75rem', color: '#858580', cursor: 'pointer' }}>
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 2.5rem 0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    borderRadius: '6px',
                    border: '1px solid #D8D8D4',
                    backgroundColor: '#FFFFFF',
                    color: '#101010',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#858580',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#101010',
                color: '#FFFFFF',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 150ms ease',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign in to Portal'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1.25rem',
              borderRadius: '8px',
              backgroundColor: '#F4F4F1',
              border: '1px solid #D8D8D4',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#171717', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Access &amp; Demo
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#858580' }}>
                Enter any email to log in
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fillDemo('admin@unigrade.edu', 'Admin@123')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D8D8D4',
                  fontSize: '0.75rem',
                  color: '#171717',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} /> <strong>Administrator (Dr. Rajesh Sharma)</strong>
                </span>
                <span style={{ color: '#858580', fontSize: '0.6875rem' }}>Admin@123</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('ananya.iyer@unigrade.edu', 'Faculty@123')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D8D8D4',
                  fontSize: '0.75rem',
                  color: '#171717',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GraduationCap size={14} /> <strong>Faculty (Dr. Ananya Iyer)</strong>
                </span>
                <span style={{ color: '#858580', fontSize: '0.6875rem' }}>Faculty@123</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('srinjoyee.goswami@gmail.com', 'Student@123')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D8D8D4',
                  fontSize: '0.75rem',
                  color: '#171717',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserCheck size={14} /> <strong>Student (Srinjoyee Goswami)</strong>
                </span>
                <span style={{ color: '#858580', fontSize: '0.6875rem' }}>Student@123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

