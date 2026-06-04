import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo / Título */}
        <div style={styles.header}>
          <div style={styles.badge}>🚔</div>
          <h1 style={styles.title}>SIGD-RECVEH</h1>
          <p style={styles.subtitle}>
            Sistema de Georreferenciación del Delito<br/>
            y Recuperación Vehicular
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Usuario</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Ingrese su usuario"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Ingrese su contraseña"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={styles.footer}>
          Unidad de Investigación de Robo y Recuperación Vehicular
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, sans-serif'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  badge: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1a237e',
    margin: '0 0 8px 0',
    letterSpacing: '2px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.6',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'center'
  },
  button: {
    background: 'linear-gradient(135deg, #1a237e, #283593)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.5px'
  },
  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#999',
    marginTop: '24px',
    marginBottom: 0
  }
};