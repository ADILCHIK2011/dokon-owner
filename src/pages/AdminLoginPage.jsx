import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTilt } from '../hooks/useTilt';
import { Button } from '../components/Button';

export function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const tilt = useTilt();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await adminLogin(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral">
      <div className="brand-blob -left-24 -top-24 h-72 w-72 opacity-25" />
      <div className="brand-blob -bottom-32 -right-24 h-96 w-96 opacity-25" style={{ animationDelay: '2s' }} />

      <form
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        onSubmit={handleSubmit}
        className="tilt-card relative z-10 w-full max-w-sm animate-scale-in rounded-box border border-base-300 bg-base-100 p-8 shadow-2xl"
      >
        <p className="font-brand text-2xl text-gradient-brand">Do'kon</p>
        <h1 className="mb-6 font-heading text-lg font-semibold text-base-content/80">
          Super Admin
        </h1>

        <label className="mb-3 block animate-fade-up" style={{ '--i': 1 }}>
          <span className="mb-1 block text-sm text-base-content/60">Login</span>
          <input
            className="input input-bordered w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </label>

        <label className="mb-4 block animate-fade-up" style={{ '--i': 2 }}>
          <span className="mb-1 block text-sm text-base-content/60">Parol</span>
          <input
            className="input input-bordered w-full"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="mb-3 text-sm text-error">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Kirilmoqda...' : 'Kirish'}
        </Button>
      </form>
    </div>
  );
}
