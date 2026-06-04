import { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import api from '../api/axios';
import BotonesReporte from '../components/shared/BotonesReporte';

const ESTADOS = ['ACTIVO','ROBADO','HURTADO','RECUPERADO','EN_INVESTIGACION'];

const ESTADO_COLORS = {
  ACTIVO:          '#43a047',
  ROBADO:          '#e53935',
  HURTADO:         '#fb8c00',
  RECUPERADO:      '#1e88e5',
  EN_INVESTIGACION:'#8e24aa'
};

const estadoLabel = {
  ACTIVO:          'Activo',
  ROBADO:          'Robado',
  HURTADO:         'Hurtado',
  RECUPERADO:      'Recuperado',
  EN_INVESTIGACION:'En Investigación'
};

const formInicial = {
  placa:'', marca:'', modelo:'', anio:'', color:'',
  estado:'ACTIVO', numSerie:'', propietarioNombre:'', propietarioDni:''
};

export default function VehiculosPage() {
  const [vehiculos,   setVehiculos]   = useState([]);
  const [tiposVeh,    setTiposVeh]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState(formInicial);
  const [editId,      setEditId]      = useState(null);
  const [busqueda,    setBusqueda]    = useState('');
  const [filtroEstado,setFiltroEstado]= useState('');
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [pagina,      setPagina]      = useState(0);
  const [totalPaginas,setTotalPaginas]= useState(0);

  useEffect(() => {
    cargarTipos();
    cargarVehiculos();
  }, [pagina, filtroEstado]);

  const cargarTipos = async () => {
    try {
      const { data } = await api.get('/catalogos/tipos-vehiculo');
      setTiposVeh(data);
    } catch {}
  };

  const cargarVehiculos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pagina, tamanio: 10 });
      if (filtroEstado) params.append('estado', filtroEstado);
      const { data } = await api.get(`/vehiculos?${params}`);
      setVehiculos(data.contenido);
      setTotalPaginas(data.totalPaginas);
    } catch {
      setError('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const buscarPorPlaca = async () => {
    if (!busqueda.trim()) { cargarVehiculos(); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/vehiculos/placa/${busqueda.trim()}`);
      setVehiculos([data]);
      setTotalPaginas(1);
    } catch {
      setVehiculos([]);
      setError('No se encontró vehículo con esa placa');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        anio: form.anio ? parseInt(form.anio) : null
      };
      if (editId) {
        await api.put(`/vehiculos/${editId}`, payload);
        setSuccess('Vehículo actualizado correctamente');
      } else {
        await api.post('/vehiculos', payload);
        setSuccess('Vehículo registrado correctamente');
      }
      setShowForm(false);
      setForm(formInicial);
      setEditId(null);
      cargarVehiculos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar vehículo');
    }
  };

  const handleEditar = v => {
    setForm({
      placa: v.placa, marca: v.marca, modelo: v.modelo,
      anio: v.anio || '', color: v.color || '',
      estado: v.estado, numSerie: v.numSerie || '',
      propietarioNombre: v.propietarioNombre || '',
      propietarioDni: v.propietarioDni || ''
    });
    setEditId(v.id);
    setShowForm(true);
  };

  const handleCambiarEstado = async (id, estado) => {
    try {
      await api.patch(`/vehiculos/${id}/estado?estado=${estado}`);
      setSuccess('Estado actualizado');
      cargarVehiculos();
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Error al cambiar estado');
    }
  };

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>Gestión de Vehículos</h1>
            <p style={s.subtitle}>Registro y seguimiento de vehículos</p>
          </div>
          <button style={s.btnPrimary}
            onClick={() => { setShowForm(true); setEditId(null);
              setForm(formInicial); }}>
            + Registrar Vehículo
          </button>
        </div>

        {/* Alertas */}
        {error   && <div style={s.alertError}>{error}</div>}
        {success && <div style={s.alertSuccess}>{success}</div>}

        {/* Búsqueda y filtros */}
        <div style={s.filtros}>
          <div style={s.searchBox}>
            <input
              style={s.searchInput}
              placeholder="Buscar por placa (ej: ABC-123)"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarPorPlaca()}
            />
            <BotonesReporte />
            <button style={s.btnSearch} onClick={buscarPorPlaca}>
              🔍 Buscar
            </button>
            {busqueda && (
              <button style={s.btnClear}
                onClick={() => { setBusqueda(''); cargarVehiculos(); }}>
                ✕ Limpiar
              </button>
            )}
          </div>
          <select style={s.select} value={filtroEstado}
            onChange={e => { setFiltroEstado(e.target.value); setPagina(0); }}>
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => (
              <option key={e} value={e}>{estadoLabel[e]}</option>
            ))}
          </select>
        </div>

        {/* Modal formulario */}
        {showForm && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>
                  {editId ? '✏️ Editar Vehículo' : '🚗 Registrar Vehículo'}
                </h2>
                <button style={s.btnClose}
                  onClick={() => { setShowForm(false); setError(''); }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={s.label}>Placa *</label>
                  <input style={s.input} required
                    placeholder="ABC-123"
                    value={form.placa}
                    onChange={e => setForm({...form,
                      placa: e.target.value.toUpperCase()})}
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Marca *</label>
                  <input style={s.input} required
                    placeholder="Toyota"
                    value={form.marca}
                    onChange={e => setForm({...form, marca: e.target.value})}
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Modelo *</label>
                  <input style={s.input} required
                    placeholder="Corolla"
                    value={form.modelo}
                    onChange={e => setForm({...form, modelo: e.target.value})}
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Año</label>
                  <input style={s.input} type="number"
                    placeholder="2020" min="1900" max="2100"
                    value={form.anio}
                    onChange={e => setForm({...form, anio: e.target.value})}
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Color</label>
                  <input style={s.input}
                    placeholder="Blanco"
                    value={form.color}
                    onChange={e => setForm({...form, color: e.target.value})}
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Estado</label>
                  <select style={s.input} value={form.estado}
                    onChange={e => setForm({...form, estado: e.target.value})}>
                    {ESTADOS.map(e => (
                      <option key={e} value={e}>{estadoLabel[e]}</option>
                    ))}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>N° de Serie</label>
                  <input style={s.input}
                    placeholder="Número de serie del vehículo"
                    value={form.numSerie}
                    onChange={e => setForm({...form, numSerie: e.target.value})}
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Propietario</label>
                  <input style={s.input}
                    placeholder="Nombre completo"
                    value={form.propietarioNombre}
                    onChange={e => setForm({...form,
                      propietarioNombre: e.target.value})}
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>DNI Propietario</label>
                  <input style={s.input}
                    placeholder="12345678"
                    value={form.propietarioDni}
                    onChange={e => setForm({...form,
                      propietarioDni: e.target.value})}
                  />
                </div>

                {error && <div style={{...s.alertError,
                  gridColumn:'1/-1'}}>{error}</div>}

                <div style={{...s.formActions, gridColumn:'1/-1'}}>
                  <button type="button" style={s.btnSecondary}
                    onClick={() => { setShowForm(false); setError(''); }}>
                    Cancelar
                  </button>
                  <button type="submit" style={s.btnPrimary}>
                    {editId ? 'Actualizar' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div style={s.tableContainer}>
          {loading ? (
            <div style={s.loading}>Cargando vehículos...</div>
          ) : vehiculos.length === 0 ? (
            <div style={s.empty}>No se encontraron vehículos</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  {['Placa','Marca / Modelo','Año','Color',
                    'Propietario','Estado','Acciones'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((v, i) => (
                  <tr key={v.id}
                    style={i % 2 === 0 ? s.trEven : s.trOdd}>
                    <td style={s.td}>
                      <span style={s.placa}>{v.placa}</span>
                    </td>
                    <td style={s.td}>
                      <div style={s.marcaModelo}>{v.marca}</div>
                      <div style={s.modeloSub}>{v.modelo}</div>
                    </td>
                    <td style={s.td}>{v.anio || '-'}</td>
                    <td style={s.td}>{v.color || '-'}</td>
                    <td style={s.td}>
                      <div>{v.propietarioNombre || '-'}</div>
                      {v.propietarioDni && (
                        <div style={s.dniSub}>DNI: {v.propietarioDni}</div>
                      )}
                    </td>
                    <td style={s.td}>
                      <select
                        style={{
                          ...s.estadoBadge,
                          background: ESTADO_COLORS[v.estado],
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        value={v.estado}
                        onChange={e =>
                          handleCambiarEstado(v.id, e.target.value)
                        }
                      >
                        {ESTADOS.map(e => (
                          <option key={e} value={e}
                            style={{background:'white', color:'#333'}}>
                            {estadoLabel[e]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={s.td}>
                      <button style={s.btnEdit}
                        onClick={() => handleEditar(v)}>
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div style={s.pagination}>
            <button style={s.btnPag}
              disabled={pagina === 0}
              onClick={() => setPagina(p => p - 1)}>
              ← Anterior
            </button>
            <span style={s.paginaInfo}>
              Página {pagina + 1} de {totalPaginas}
            </span>
            <button style={s.btnPag}
              disabled={pagina >= totalPaginas - 1}
              onClick={() => setPagina(p => p + 1)}>
              Siguiente →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  layout: { display:'flex', fontFamily:'system-ui, sans-serif' },
  main: {
    marginLeft:'240px', flex:1, padding:'32px',
    minHeight:'100vh', background:'#f5f7fa'
  },
  topBar: {
    display:'flex', justifyContent:'space-between',
    alignItems:'flex-start', marginBottom:'24px'
  },
  title: { fontSize:'28px', fontWeight:'800',
    color:'#0d1b2a', margin:'0 0 4px 0' },
  subtitle: { color:'#666', margin:0, fontSize:'14px' },
  alertError: {
    background:'#ffebee', color:'#c62828',
    padding:'12px 16px', borderRadius:'8px',
    marginBottom:'16px', fontSize:'14px'
  },
  alertSuccess: {
    background:'#e8f5e9', color:'#2e7d32',
    padding:'12px 16px', borderRadius:'8px',
    marginBottom:'16px', fontSize:'14px'
  },
  filtros: {
    display:'flex', gap:'12px',
    marginBottom:'20px', flexWrap:'wrap'
  },
  searchBox: { display:'flex', gap:'8px', flex:1 },
  searchInput: {
    flex:1, padding:'10px 16px',
    borderRadius:'8px', border:'2px solid #e0e0e0',
    fontSize:'14px', outline:'none'
  },
  btnSearch: {
    padding:'10px 20px', background:'#1565c0',
    color:'white', border:'none', borderRadius:'8px',
    cursor:'pointer', fontSize:'14px', fontWeight:'600'
  },
  btnClear: {
    padding:'10px 16px', background:'#e0e0e0',
    color:'#333', border:'none', borderRadius:'8px',
    cursor:'pointer', fontSize:'14px'
  },
  select: {
    padding:'10px 16px', borderRadius:'8px',
    border:'2px solid #e0e0e0', fontSize:'14px',
    background:'white', cursor:'pointer', outline:'none'
  },
  btnPrimary: {
    padding:'12px 24px', background:'#1565c0',
    color:'white', border:'none', borderRadius:'8px',
    cursor:'pointer', fontSize:'14px', fontWeight:'700'
  },
  btnSecondary: {
    padding:'12px 24px', background:'#e0e0e0',
    color:'#333', border:'none', borderRadius:'8px',
    cursor:'pointer', fontSize:'14px', fontWeight:'600'
  },
  modalOverlay: {
    position:'fixed', inset:0,
    background:'rgba(0,0,0,0.5)',
    display:'flex', alignItems:'center',
    justifyContent:'center', zIndex:1000
  },
  modal: {
    background:'white', borderRadius:'16px',
    padding:'32px', width:'100%', maxWidth:'640px',
    maxHeight:'90vh', overflowY:'auto',
    boxShadow:'0 20px 60px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display:'flex', justifyContent:'space-between',
    alignItems:'center', marginBottom:'24px'
  },
  modalTitle: {
    fontSize:'20px', fontWeight:'800',
    color:'#0d1b2a', margin:0
  },
  btnClose: {
    background:'none', border:'none',
    fontSize:'20px', cursor:'pointer', color:'#666'
  },
  formGrid: {
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:'16px'
  },
  formGroup: {
    display:'flex', flexDirection:'column', gap:'6px'
  },
  label: {
    fontSize:'13px', fontWeight:'600', color:'#333'
  },
  input: {
    padding:'10px 14px', borderRadius:'8px',
    border:'2px solid #e0e0e0', fontSize:'14px',
    outline:'none'
  },
  formActions: {
    display:'flex', justifyContent:'flex-end',
    gap:'12px', marginTop:'8px'
  },
  tableContainer: {
    background:'white', borderRadius:'12px',
    boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
    overflow:'hidden'
  },
  loading: { padding:'40px', textAlign:'center', color:'#666' },
  empty: { padding:'40px', textAlign:'center', color:'#999' },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { background:'#0d1b2a' },
  th: {
    padding:'14px 16px', textAlign:'left',
    color:'white', fontSize:'13px',
    fontWeight:'600', whiteSpace:'nowrap'
  },
  trEven: { background:'white' },
  trOdd:  { background:'#f8f9fa' },
  td: {
    padding:'12px 16px', fontSize:'13px',
    color:'#333', borderBottom:'1px solid #f0f0f0',
    verticalAlign:'middle'
  },
  placa: {
    background:'#e3f2fd', color:'#1565c0',
    padding:'4px 10px', borderRadius:'6px',
    fontWeight:'700', fontSize:'13px',
    letterSpacing:'1px'
  },
  marcaModelo: { fontWeight:'600', color:'#0d1b2a' },
  modeloSub: { fontSize:'12px', color:'#888' },
  dniSub: { fontSize:'11px', color:'#888' },
  estadoBadge: {
    padding:'4px 12px', borderRadius:'20px',
    fontSize:'12px', fontWeight:'600'
  },
  btnEdit: {
    background:'none', border:'none',
    cursor:'pointer', fontSize:'16px',
    padding:'4px 8px', borderRadius:'6px'
  },
  pagination: {
    display:'flex', justifyContent:'center',
    alignItems:'center', gap:'16px',
    marginTop:'20px', padding:'16px'
  },
  btnPag: {
    padding:'8px 20px', borderRadius:'8px',
    border:'2px solid #e0e0e0', background:'white',
    cursor:'pointer', fontSize:'13px', fontWeight:'600'
  },
  paginaInfo: { color:'#666', fontSize:'14px' }
};