import { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import api from '../api/axios';

const ROLES = ['ADMIN','OPERADOR','ANALISTA','CONSULTOR'];

const rolLabel = {
  ADMIN:     'Administrador',
  OPERADOR:  'Operador Policial',
  ANALISTA:  'Analista / Supervisor',
  CONSULTOR: 'Consultor'
};

const rolColor = {
  ADMIN:     '#b71c1c',
  OPERADOR:  '#1565c0',
  ANALISTA:  '#4a148c',
  CONSULTOR: '#1b5e20'
};

const formInicial = {
  username:'', password:'', nombreCompleto:'',
  email:'', rol:'OPERADOR', activo: true
};

export default function UsuariosPage() {
  const [usuarios,  setUsuarios]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(formInicial);
  const [editId,    setEditId]    = useState(null);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [showPass,  setShowPass]  = useState(false);

  useEffect(() => { cargarUsuarios(); }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await api.put(`/usuarios/${editId}`, form);
        setSuccess('Usuario actualizado correctamente');
      } else {
        await api.post('/usuarios', form);
        setSuccess('Usuario creado correctamente');
      }
      setShowForm(false);
      setForm(formInicial);
      setEditId(null);
      cargarUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleEditar = u => {
    setForm({
      username:       u.username,
      password:       '',
      nombreCompleto: u.nombreCompleto,
      email:          u.email || '',
      rol:            u.rol,
      activo:         u.activo
    });
    setEditId(u.id);
    setShowForm(true);
    setError('');
  };

  const handleCambiarEstado = async (id, activo) => {
    try {
      await api.patch(`/usuarios/${id}/estado?activo=${activo}`);
      setSuccess(activo ? 'Usuario activado' : 'Usuario desactivado');
      cargarUsuarios();
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Error al cambiar estado');
    }
  };

  const totalPorRol = rol =>
    usuarios.filter(u => u.rol === rol).length;

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>

        {/* Header */}
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>Gestión de Usuarios</h1>
            <p style={s.subtitle}>
              Administración de accesos al sistema — solo ADMIN
            </p>
          </div>
          <button style={s.btnPrimary}
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setForm(formInicial);
              setError('');
            }}>
            + Nuevo Usuario
          </button>
        </div>

        {/* Alertas */}
        {error   && <div style={s.alertError}>{error}</div>}
        {success && <div style={s.alertSuccess}>{success}</div>}

        {/* Tarjetas resumen por rol */}
        <div style={s.rolesGrid}>
          {ROLES.map(rol => (
            <div key={rol} style={s.rolCard}>
              <div style={{
                ...s.rolBadge,
                background: rolColor[rol]
              }}>
                {rolLabel[rol]}
              </div>
              <div style={s.rolCount}>
                {totalPorRol(rol)}
              </div>
              <div style={s.rolLabel}>usuarios</div>
            </div>
          ))}
        </div>

        {/* Modal formulario */}
        {showForm && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>
                  {editId ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}
                </h2>
                <button style={s.btnClose}
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                  }}>✕</button>
              </div>

              <form onSubmit={handleSubmit} style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={s.label}>
                    Username *
                  </label>
                  <input style={s.input} required
                    placeholder="juan.perez"
                    value={form.username}
                    onChange={e => setForm({
                      ...form,
                      username: e.target.value.toLowerCase()})}
                  />
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>
                    {editId
                      ? 'Nueva contraseña (dejar vacío para no cambiar)'
                      : 'Contraseña *'
                    }
                  </label>
                  <div style={s.passWrapper}>
                    <input
                      style={{...s.input, flex:1}}
                      type={showPass ? 'text' : 'password'}
                      placeholder={editId
                        ? 'Nueva contraseña...'
                        : 'Mínimo 6 caracteres'}
                      required={!editId}
                      value={form.password}
                      onChange={e => setForm({
                        ...form, password: e.target.value})}
                    />
                    <button
                      type="button"
                      style={s.btnTogglePass}
                      onClick={() => setShowPass(v => !v)}
                    >
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={{...s.formGroup, gridColumn:'1/-1'}}>
                  <label style={s.label}>Nombre Completo *</label>
                  <input style={s.input} required
                    placeholder="Juan Carlos Pérez López"
                    value={form.nombreCompleto}
                    onChange={e => setForm({
                      ...form, nombreCompleto: e.target.value})}
                  />
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Email</label>
                  <input style={s.input} type="email"
                    placeholder="juan@policia.pe"
                    value={form.email}
                    onChange={e => setForm({
                      ...form, email: e.target.value})}
                  />
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Rol *</label>
                  <select style={s.input}
                    value={form.rol}
                    onChange={e => setForm({
                      ...form, rol: e.target.value})}>
                    {ROLES.map(r => (
                      <option key={r} value={r}>
                        {rolLabel[r]}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{
                  ...s.formGroup,
                  gridColumn:'1/-1'
                }}>
                  <label style={s.label}>Estado</label>
                  <div style={s.toggleRow}>
                    <button
                      type="button"
                      style={{
                        ...s.toggleBtn,
                        background: form.activo
                          ? '#e8f5e9' : '#f5f5f5',
                        borderColor: form.activo
                          ? '#43a047' : '#e0e0e0',
                        color: form.activo
                          ? '#2e7d32' : '#999'
                      }}
                      onClick={() => setForm({
                        ...form, activo: !form.activo})}
                    >
                      {form.activo
                        ? '✅ Usuario Activo'
                        : '❌ Usuario Inactivo'
                      }
                    </button>
                    <span style={s.toggleHint}>
                      {form.activo
                        ? 'El usuario puede iniciar sesión'
                        : 'El usuario no puede iniciar sesión'
                      }
                    </span>
                  </div>
                </div>

                {/* Descripción del rol */}
                <div style={{
                  ...s.rolInfo,
                  gridColumn:'1/-1',
                  borderColor: rolColor[form.rol]
                }}>
                  <strong style={{color: rolColor[form.rol]}}>
                    {rolLabel[form.rol]}:
                  </strong>
                  {' '}{getRolDescripcion(form.rol)}
                </div>

                {error && (
                  <div style={{
                    ...s.alertError, gridColumn:'1/-1'
                  }}>
                    {error}
                  </div>
                )}

                <div style={{
                  ...s.formActions, gridColumn:'1/-1'
                }}>
                  <button type="button" style={s.btnSecondary}
                    onClick={() => {
                      setShowForm(false);
                      setError('');
                    }}>
                    Cancelar
                  </button>
                  <button type="submit" style={s.btnPrimary}>
                    {editId ? 'Actualizar Usuario' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div style={s.tableContainer}>
          {loading ? (
            <div style={s.loading}>Cargando usuarios...</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  {['Usuario','Nombre Completo','Email',
                    'Rol','Estado','Creado','Acciones']
                    .map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u, i) => (
                  <tr key={u.id}
                    style={{
                      ...(i % 2 === 0 ? s.trEven : s.trOdd),
                      opacity: u.activo ? 1 : 0.6
                    }}>
                    <td style={s.td}>
                      <div style={s.userCell}>
                        <div style={{
                          ...s.avatar,
                          background: rolColor[u.rol]
                        }}>
                          {u.nombreCompleto.charAt(0)
                            .toUpperCase()}
                        </div>
                        <span style={s.username}>
                          {u.username}
                        </span>
                      </div>
                    </td>
                    <td style={s.td}>
                      {u.nombreCompleto}
                    </td>
                    <td style={s.td}>
                      {u.email || '-'}
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.rolBadgeSmall,
                        background: rolColor[u.rol]
                      }}>
                        {rolLabel[u.rol]}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        style={{
                          ...s.estadoBtn,
                          background: u.activo
                            ? '#e8f5e9' : '#ffebee',
                          color: u.activo
                            ? '#2e7d32' : '#c62828',
                          borderColor: u.activo
                            ? '#a5d6a7' : '#ef9a9a'
                        }}
                        onClick={() => handleCambiarEstado(
                          u.id, !u.activo)}
                      >
                        {u.activo ? '✅ Activo' : '❌ Inactivo'}
                      </button>
                    </td>
                    <td style={s.td}>
                      <span style={s.fecha}>
                        {u.createdAt
                          ? new Date(u.createdAt)
                              .toLocaleDateString('es-PE')
                          : '-'
                        }
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        style={s.btnEdit}
                        onClick={() => handleEditar(u)}
                      >
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  );
}

function getRolDescripcion(rol) {
  const desc = {
    ADMIN:     'Acceso total al sistema. Gestiona usuarios, configuración y todos los módulos.',
    OPERADOR:  'Registra incidentes y vehículos. Actualiza estados de casos.',
    ANALISTA:  'Visualiza mapas, genera reportes y analiza estadísticas. Solo lectura.',
    CONSULTOR: 'Consulta básica de información. Sin capacidad de modificación.'
  };
  return desc[rol] || '';
}

const s = {
  layout:{ display:'flex', fontFamily:'system-ui, sans-serif' },
  main:{
    marginLeft:'240px', flex:1, padding:'32px',
    minHeight:'100vh', background:'#f5f7fa'
  },
  topBar:{
    display:'flex', justifyContent:'space-between',
    alignItems:'flex-start', marginBottom:'24px'
  },
  title:{
    fontSize:'28px', fontWeight:'800',
    color:'#0d1b2a', margin:'0 0 4px 0'
  },
  subtitle:{ color:'#666', margin:0, fontSize:'14px' },
  alertError:{
    background:'#ffebee', color:'#c62828',
    padding:'12px 16px', borderRadius:'8px',
    marginBottom:'16px', fontSize:'14px'
  },
  alertSuccess:{
    background:'#e8f5e9', color:'#2e7d32',
    padding:'12px 16px', borderRadius:'8px',
    marginBottom:'16px', fontSize:'14px'
  },
  rolesGrid:{
    display:'grid',
    gridTemplateColumns:'repeat(4, 1fr)',
    gap:'16px', marginBottom:'24px'
  },
  rolCard:{
    background:'white', borderRadius:'12px',
    padding:'20px', textAlign:'center',
    boxShadow:'0 2px 8px rgba(0,0,0,0.08)'
  },
  rolBadge:{
    color:'white', padding:'6px 14px',
    borderRadius:'20px', fontSize:'12px',
    fontWeight:'700', display:'inline-block',
    marginBottom:'12px'
  },
  rolCount:{
    fontSize:'36px', fontWeight:'800',
    color:'#0d1b2a', lineHeight:1
  },
  rolLabel:{
    fontSize:'12px', color:'#888',
    marginTop:'4px'
  },
  btnPrimary:{
    padding:'12px 24px', background:'#1565c0',
    color:'white', border:'none', borderRadius:'8px',
    cursor:'pointer', fontSize:'14px', fontWeight:'700'
  },
  btnSecondary:{
    padding:'12px 24px', background:'#e0e0e0',
    color:'#333', border:'none', borderRadius:'8px',
    cursor:'pointer', fontSize:'14px', fontWeight:'600'
  },
  modalOverlay:{
    position:'fixed', inset:0,
    background:'rgba(0,0,0,0.6)',
    display:'flex', alignItems:'center',
    justifyContent:'center', zIndex:1000,
    padding:'20px'
  },
  modal:{
    background:'white', borderRadius:'16px',
    padding:'32px', width:'100%', maxWidth:'580px',
    maxHeight:'90vh', overflowY:'auto',
    boxShadow:'0 20px 60px rgba(0,0,0,0.3)'
  },
  modalHeader:{
    display:'flex', justifyContent:'space-between',
    alignItems:'center', marginBottom:'24px'
  },
  modalTitle:{
    fontSize:'20px', fontWeight:'800',
    color:'#0d1b2a', margin:0
  },
  btnClose:{
    background:'none', border:'none',
    fontSize:'20px', cursor:'pointer', color:'#666'
  },
  formGrid:{
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:'16px'
  },
  formGroup:{
    display:'flex', flexDirection:'column', gap:'6px'
  },
  label:{
    fontSize:'13px', fontWeight:'600', color:'#333'
  },
  input:{
    padding:'10px 14px', borderRadius:'8px',
    border:'2px solid #e0e0e0', fontSize:'14px',
    outline:'none', width:'100%', boxSizing:'border-box'
  },
  passWrapper:{
    display:'flex', gap:'8px', alignItems:'center'
  },
  btnTogglePass:{
    background:'#f5f5f5', border:'2px solid #e0e0e0',
    borderRadius:'8px', padding:'10px 12px',
    cursor:'pointer', fontSize:'16px'
  },
  toggleRow:{
    display:'flex', alignItems:'center', gap:'12px'
  },
  toggleBtn:{
    padding:'10px 20px', borderRadius:'8px',
    border:'2px solid', cursor:'pointer',
    fontSize:'14px', fontWeight:'600',
    transition:'all 0.2s'
  },
  toggleHint:{
    fontSize:'12px', color:'#888',
    fontStyle:'italic'
  },
  rolInfo:{
    padding:'12px 16px', borderRadius:'8px',
    border:'2px solid', background:'#fafafa',
    fontSize:'13px', color:'#555',
    lineHeight:'1.5'
  },
  formActions:{
    display:'flex', justifyContent:'flex-end',
    gap:'12px', marginTop:'8px'
  },
  tableContainer:{
    background:'white', borderRadius:'12px',
    boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
    overflow:'hidden'
  },
  loading:{
    padding:'40px', textAlign:'center', color:'#666'
  },
  table:{ width:'100%', borderCollapse:'collapse' },
  thead:{ background:'#0d1b2a' },
  th:{
    padding:'14px 16px', textAlign:'left',
    color:'white', fontSize:'13px',
    fontWeight:'600', whiteSpace:'nowrap'
  },
  trEven:{ background:'white' },
  trOdd:{ background:'#f8f9fa' },
  td:{
    padding:'12px 16px', fontSize:'13px',
    color:'#333', borderBottom:'1px solid #f0f0f0',
    verticalAlign:'middle'
  },
  userCell:{
    display:'flex', alignItems:'center', gap:'10px'
  },
  avatar:{
    width:'32px', height:'32px', borderRadius:'50%',
    color:'white', display:'flex',
    alignItems:'center', justifyContent:'center',
    fontWeight:'700', fontSize:'14px',
    flexShrink:0
  },
  username:{
    fontWeight:'600', color:'#0d1b2a'
  },
  rolBadgeSmall:{
    color:'white', padding:'3px 10px',
    borderRadius:'12px', fontSize:'11px',
    fontWeight:'700'
  },
  estadoBtn:{
    padding:'4px 12px', borderRadius:'20px',
    border:'2px solid', cursor:'pointer',
    fontSize:'12px', fontWeight:'600',
    background:'none', transition:'all 0.2s'
  },
  fecha:{
    fontSize:'12px', color:'#888'
  },
  btnEdit:{
    background:'#e3f2fd', border:'none',
    padding:'6px 14px', borderRadius:'6px',
    cursor:'pointer', fontSize:'12px',
    fontWeight:'600', color:'#1565c0'
  }
};