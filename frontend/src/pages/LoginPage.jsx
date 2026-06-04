import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form,    setForm]    = useState({ username: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass,setShowPass]= useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

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
    <div style={s.container}>

      {/* Panel izquierdo — Identidad institucional */}
      <div style={s.panelIzq}>
        <div style={s.panelContent}>
          <img
            src="/logo-diprove.png"
            alt="Logo DIPROVE"
            style={s.logoBig}
          />
          <h2 style={s.panelTitle}>DIPROVE</h2>
          <p style={s.panelSub}>
            Dirección de Prevención e Investigación<br />
            de Robo de Vehículos
          </p>
          <div style={s.divider} />
          <div style={s.stats}>
            <div style={s.statItem}>
              <div style={s.statNum}>24/7</div>
              <div style={s.statLabel}>Monitoreo</div>
            </div>
            <div style={s.statItem}>
              <div style={s.statNum}>GIS</div>
              <div style={s.statLabel}>Georreferenciación</div>
            </div>
            <div style={s.statItem}>
              <div style={s.statNum}>PNP</div>
              <div style={s.statLabel}>Policia Nacional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — Formulario */}
      <div style={s.panelDer}>
        <div style={s.card}>

          {/* Header */}
          <div style={s.header}>
            <div style={s.logoSmallBox}>
              <img
                src="/logo-diprove.png"
                alt="Logo DIPROVE"
                style={s.logoSmall}
              />
            </div>
            <h1 style={s.title}>SIGD-RECVEH</h1>
            <p style={s.titleSub}>
              Sistema Inteligente de Georreferenciación<br />
              del Delito y Recuperación Vehicular
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={s.form}>

            <div style={s.field}>
              <label style={s.label}>
                <span style={s.labelIcon}>👤</span> Usuario
              </label>
              <input
                style={s.input}
                type="text"
                placeholder="Ingrese su usuario"
                value={form.username}
                autoComplete="username"
                onChange={e => setForm({
                  ...form, username: e.target.value
                })}
                required
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>
                <span style={s.labelIcon}>🔒</span> Contraseña
              </label>
              <div style={s.passWrapper}>
                <input
                  style={{ ...s.input, paddingRight: '48px' }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Ingrese su contraseña"
                  value={form.password}
                  autoComplete="current-password"
                  onChange={e => setForm({
                    ...form, password: e.target.value
                  })}
                  required
                />
                <button
                  type="button"
                  style={s.togglePass}
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={s.error}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                ...s.button,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading
                ? '⏳ Verificando credenciales...'
                : '🔐 Iniciar Sesión'
              }
            </button>

          </form>

          {/* Footer */}
          <div style={s.footer}>
            <div style={s.footerBadge}>🏛️ Uso exclusivo — Personal PNP</div>
            <p style={s.footerText}>
              Unidad de Investigación de Robo y Recuperación Vehicular<br />
              Trujillo, La Libertad — Perú
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    fontFamily: 'system-ui, sans-serif',
    background: '#f5f7fa'
  },

  // Panel izquierdo
  panelIzq: {
    width: '420px',
    background: 'linear-gradient(160deg, #0d1b2a 0%, #1b2838 50%, #0d2137 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden'
  },
  panelContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    zIndex: 1,
    position: 'relative'
  },
  logoBig: {
    width: '160px',
    height: '160px',
    objectFit: 'contain',
    marginBottom: '24px',
    filter: 'drop-shadow(0 4px 24px rgba(255,193,7,0.3))'
  },
  panelTitle: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#ffc107',
    margin: '0 0 8px 0',
    letterSpacing: '4px'
  },
  panelSub: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.6',
    margin: 0
  },
  divider: {
    width: '60px',
    height: '2px',
    background: 'rgba(255,193,7,0.4)',
    margin: '28px auto'
  },
  stats: {
    display: 'flex',
    gap: '32px'
  },
  statItem: {
    textAlign: 'center'
  },
  statNum: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffc107',
    letterSpacing: '1px'
  },
  statLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '4px'
  },

  // Panel derecho
  panelDer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
  },

  // Header del formulario
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  logoSmallBox: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: '#f5f7fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    border: '2px solid #e0e0e0'
  },
  logoSmall: {
    width: '52px',
    height: '52px',
    objectFit: 'contain'
  },
  title: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#0d1b2a',
    margin: '0 0 8px 0',
    letterSpacing: '2px'
  },
  titleSub: {
    fontSize: '12px',
    color: '#888',
    lineHeight: '1.6',
    margin: 0
  },

  // Formulario
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  labelIcon: { fontSize: '14px' },
  passWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    padding: '13px 16px',
    borderRadius: '10px',
    border: '2px solid #e8e8e8',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    background: '#fafafa'
  },
  togglePass: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    textAlign: 'center',
    border: '1px solid #ffcdd2'
  },
  button: {
    background: 'linear-gradient(135deg, #0d1b2a, #1b3a5c)',
    color: 'white',
    border: 'none',
    padding: '15px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    marginTop: '4px',
    transition: 'opacity 0.2s',
    boxShadow: '0 4px 16px rgba(13,27,42,0.3)'
  },

  // Footer
  footer: {
    marginTop: '28px',
    textAlign: 'center',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '20px'
  },
  footerBadge: {
    display: 'inline-block',
    background: '#fff8e1',
    color: '#f57f17',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '10px',
    border: '1px solid #ffe082'
  },
  footerText: {
    fontSize: '11px',
    color: '#aaa',
    lineHeight: '1.6',
    margin: 0
  }
};