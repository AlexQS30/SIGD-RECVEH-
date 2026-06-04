import { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import SelectorUbicacion from '../components/mapa/SelectorUbicacion';
import api from '../api/axios';

const TIPOS = ['ROBO','HURTO','RECUPERACION','HALLAZGO'];
const ESTADOS_INC = ['ABIERTO','EN_INVESTIGACION','CERRADO','ARCHIVADO'];

const tipoLabel = {
  ROBO:'Robo', HURTO:'Hurto',
  RECUPERACION:'Recuperación', HALLAZGO:'Hallazgo'
};
const estadoLabel = {
  ABIERTO:'Abierto', EN_INVESTIGACION:'En Investigación',
  CERRADO:'Cerrado', ARCHIVADO:'Archivado'
};
const tipoColor = {
  ROBO:'#e53935', HURTO:'#fb8c00',
  RECUPERACION:'#43a047', HALLAZGO:'#1e88e5'
};
const estadoColor = {
  ABIERTO:'#e53935', EN_INVESTIGACION:'#fb8c00',
  CERRADO:'#43a047', ARCHIVADO:'#9e9e9e'
};

const formInicial = {
  tipoDelito:'ROBO', fechaHecho:'', horaHecho:'',
  descripcion:'', numDenunciaSirdic:'', distritoId:'',
  vehiculoIds:[], placaBusqueda:'',
  ubicacion:{
    latitud:'', longitud:'',
    direccionReferencia:'', tipoUbicacion:'OCURRENCIA'
  }
};

export default function IncidentesPage() {
  const [incidentes,          setIncidentes]          = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [showForm,            setShowForm]            = useState(false);
  const [form,                setForm]                = useState(formInicial);
  const [vehiculoEncontrado,  setVehiculoEncontrado]  = useState(null);
  const [vehiculosAgregados,  setVehiculosAgregados]  = useState([]);
  const [error,               setError]               = useState('');
  const [success,             setSuccess]             = useState('');
  const [filtroTipo,          setFiltroTipo]          = useState('');
  const [pagina,              setPagina]              = useState(0);
  const [totalPaginas,        setTotalPaginas]        = useState(0);
  const [detalle,             setDetalle]             = useState(null);

  useEffect(() => {
    cargarIncidentes();
  }, [pagina, filtroTipo]);

  const cargarIncidentes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pagina, tamanio: 10 });
      if (filtroTipo) params.append('tipoDelito', filtroTipo);
      const { data } = await api.get(`/incidentes?${params}`);
      setIncidentes(data.contenido);
      setTotalPaginas(data.totalPaginas);
    } catch {
      setError('Error al cargar incidentes');
    } finally {
      setLoading(false);
    }
  };

  const buscarVehiculo = async () => {
    if (!form.placaBusqueda.trim()) return;
    setError('');
    try {
      const { data } = await api.get(
        `/vehiculos/placa/${form.placaBusqueda.trim()}`);
      setVehiculoEncontrado(data);
      if (!form.vehiculoIds.includes(data.id)) {
        setForm(f => ({
          ...f,
          vehiculoIds: [...f.vehiculoIds, data.id],
          placaBusqueda: ''
        }));
        setVehiculosAgregados(prev => [...prev, data]);
      } else {
        setError('Este vehículo ya fue agregado');
        setTimeout(() => setError(''), 2000);
      }
    } catch {
      setError('Vehículo no encontrado con esa placa');
      setTimeout(() => setError(''), 3000);
    }
  };

  const quitarVehiculo = (id) => {
    setForm(f => ({
      ...f,
      vehiculoIds: f.vehiculoIds.filter(vid => vid !== id)
    }));
    setVehiculosAgregados(prev => prev.filter(v => v.id !== id));
    if (vehiculoEncontrado?.id === id) setVehiculoEncontrado(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (form.vehiculoIds.length === 0) {
      setError('Debe agregar al menos un vehículo');
      return;
    }
    if (!form.ubicacion.latitud || !form.ubicacion.longitud) {
      setError('Debe seleccionar la ubicación en el mapa');
      return;
    }

    try {
      const payload = {
        tipoDelito:        form.tipoDelito,
        fechaHecho:        form.fechaHecho,
        horaHecho:         form.horaHecho || null,
        descripcion:       form.descripcion,
        numDenunciaSirdic: form.numDenunciaSirdic,
        vehiculoIds:       form.vehiculoIds,
        ubicacion: {
          latitud:             parseFloat(form.ubicacion.latitud),
          longitud:            parseFloat(form.ubicacion.longitud),
          direccionReferencia: form.ubicacion.direccionReferencia,
          tipoUbicacion:       'OCURRENCIA'
        }
      };

      await api.post('/incidentes', payload);
      setSuccess('✅ Incidente registrado correctamente');
      setShowForm(false);
      setForm(formInicial);
      setVehiculoEncontrado(null);
      setVehiculosAgregados([]);
      cargarIncidentes();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar incidente');
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await api.patch(`/incidentes/${id}/estado?estado=${estado}`);
      cargarIncidentes();
    } catch {
      setError('Error al cambiar estado');
    }
  };

  const verDetalle = async (id) => {
    try {
      const { data } = await api.get(`/incidentes/${id}`);
      setDetalle(data);
    } catch {
      setError('Error al cargar detalle');
    }
  };

  return (
    <div style={s.layout}>
      <Sidebar />
      <main style={s.main}>

        {/* Header */}
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>Gestión de Incidentes</h1>
            <p style={s.subtitle}>
              Registro de robos, hurtos y recuperaciones vehiculares
            </p>
          </div>
          <button style={s.btnPrimary}
            onClick={() => {
              setShowForm(true);
              setForm(formInicial);
              setVehiculoEncontrado(null);
              setVehiculosAgregados([]);
              setError('');
            }}>
            + Registrar Incidente
          </button>
        </div>

        {/* Alertas */}
        {error   && <div style={s.alertError}>{error}</div>}
        {success && <div style={s.alertSuccess}>{success}</div>}

        {/* Filtros */}
        <div style={s.filtros}>
          <select style={s.select} value={filtroTipo}
            onChange={e => {
              setFiltroTipo(e.target.value);
              setPagina(0);
            }}>
            <option value="">Todos los tipos</option>
            {TIPOS.map(t => (
              <option key={t} value={t}>{tipoLabel[t]}</option>
            ))}
          </select>
        </div>

        {/* ─── MODAL FORMULARIO ─── */}
        {showForm && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>📋 Registrar Incidente</h2>
                <button style={s.btnClose}
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                  }}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>

                {/* Sección 1: Datos del incidente */}
                <div style={s.seccion}>
                  <h3 style={s.seccionTitle}>Datos del Incidente</h3>
                  <div style={s.formGrid}>
                    <div style={s.formGroup}>
                      <label style={s.label}>Tipo de Delito *</label>
                      <select style={s.input} required
                        value={form.tipoDelito}
                        onChange={e => setForm({
                          ...form, tipoDelito: e.target.value})}>
                        {TIPOS.map(t => (
                          <option key={t} value={t}>{tipoLabel[t]}</option>
                        ))}
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>N° Denuncia SIRDIC</label>
                      <input style={s.input}
                        placeholder="2026-TRU-001234"
                        value={form.numDenunciaSirdic}
                        onChange={e => setForm({
                          ...form, numDenunciaSirdic: e.target.value})}
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Fecha del Hecho *</label>
                      <input style={s.input} type="date" required
                        value={form.fechaHecho}
                        onChange={e => setForm({
                          ...form, fechaHecho: e.target.value})}
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>Hora del Hecho</label>
                      <input style={s.input} type="time"
                        value={form.horaHecho}
                        onChange={e => setForm({
                          ...form, horaHecho: e.target.value})}
                      />
                    </div>
                    <div style={{...s.formGroup, gridColumn:'1/-1'}}>
                      <label style={s.label}>Descripción</label>
                      <textarea
                        style={{...s.input, height:'80px', resize:'vertical'}}
                        placeholder="Descripción detallada del hecho..."
                        value={form.descripcion}
                        onChange={e => setForm({
                          ...form, descripcion: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 2: Vehículos */}
                <div style={s.seccion}>
                  <h3 style={s.seccionTitle}>
                    Vehículo(s) Involucrado(s)
                  </h3>
                  <div style={s.searchVeh}>
                    <input style={{...s.input, flex:1}}
                      placeholder="Ingrese la placa del vehículo (ej: ABC-123)"
                      value={form.placaBusqueda}
                      onChange={e => setForm({
                        ...form,
                        placaBusqueda: e.target.value.toUpperCase()})}
                      onKeyDown={e =>
                        e.key === 'Enter' &&
                        (e.preventDefault(), buscarVehiculo())}
                    />
                    <button type="button" style={s.btnSearch}
                      onClick={buscarVehiculo}>
                      🔍 Buscar y Agregar
                    </button>
                  </div>

                  {/* Lista de vehículos agregados */}
                  {vehiculosAgregados.length > 0 && (
                    <div style={s.vehList}>
                      {vehiculosAgregados.map(v => (
                        <div key={v.id} style={s.vehCard}>
                          <span style={s.placa}>{v.placa}</span>
                          <span style={s.vehInfo}>
                            {v.marca} {v.modelo} {v.anio}
                          </span>
                          <span style={s.vehProp}>
                            {v.propietarioNombre || 'Sin propietario'}
                          </span>
                          <span style={{
                            color: tipoColor[v.estado] || '#333',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}>
                            {v.estado}
                          </span>
                          <button
                            type="button"
                            style={s.btnQuitar}
                            onClick={() => quitarVehiculo(v.id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {form.vehiculoIds.length === 0 && (
                    <p style={s.hint}>
                      🚗 Busca el vehículo por placa para vincularlo al incidente
                    </p>
                  )}
                </div>

                {/* Sección 3: Ubicación con mapa */}
                <div style={s.seccion}>
                  <h3 style={s.seccionTitle}>
                    Ubicación del Hecho *
                  </h3>
                  <SelectorUbicacion
                    value={form.ubicacion}
                    onChange={ubicacion =>
                      setForm({ ...form, ubicacion })
                    }
                  />
                </div>

                {/* Error del formulario */}
                {error && (
                  <div style={s.alertError}>{error}</div>
                )}

                {/* Acciones */}
                <div style={s.formActions}>
                  <button type="button" style={s.btnSecondary}
                    onClick={() => {
                      setShowForm(false);
                      setError('');
                    }}>
                    Cancelar
                  </button>
                  <button type="submit" style={s.btnPrimary}>
                    ✅ Registrar Incidente
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ─── MODAL DETALLE ─── */}
        {detalle && (
          <div style={s.modalOverlay}
            onClick={() => setDetalle(null)}>
            <div style={{...s.modal, maxWidth:'520px'}}
              onClick={e => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>
                  📋 {detalle.numeroCaso}
                </h2>
                <button style={s.btnClose}
                  onClick={() => setDetalle(null)}>✕</button>
              </div>
              <div style={s.detalleGrid}>
                <div style={s.detalleRow}>
                  <span style={s.detalleKey}>Tipo</span>
                  <span style={{
                    color: tipoColor[detalle.tipoDelito],
                    fontWeight:'700'
                  }}>
                    {detalle.tipoDelitoDescripcion}
                  </span>
                </div>
                <div style={s.detalleRow}>
                  <span style={s.detalleKey}>Estado</span>
                  <span style={{
                    color: estadoColor[detalle.estado],
                    fontWeight:'700'
                  }}>
                    {detalle.estadoDescripcion}
                  </span>
                </div>
                <div style={s.detalleRow}>
                  <span style={s.detalleKey}>Fecha</span>
                  <span>
                    {detalle.fechaHecho}
                    {detalle.horaHecho && ` a las ${detalle.horaHecho}`}
                  </span>
                </div>
                <div style={s.detalleRow}>
                  <span style={s.detalleKey}>SIRDIC</span>
                  <span>{detalle.numDenunciaSirdic || '-'}</span>
                </div>
                <div style={s.detalleRow}>
                  <span style={s.detalleKey}>Responsable</span>
                  <span>{detalle.usuarioResponsable}</span>
                </div>
                {detalle.descripcion && (
                  <div style={{
                    ...s.detalleRow,
                    flexDirection:'column', gap:'4px'
                  }}>
                    <span style={s.detalleKey}>Descripción</span>
                    <span style={{color:'#555', lineHeight:'1.5'}}>
                      {detalle.descripcion}
                    </span>
                  </div>
                )}
                <div style={{
                  ...s.detalleRow,
                  flexDirection:'column', gap:'8px'
                }}>
                  <span style={s.detalleKey}>Vehículos</span>
                  {detalle.vehiculos?.map(v => (
                    <div key={v.id} style={s.vehCard}>
                      <span style={s.placa}>{v.placa}</span>
                      <span>{v.marca} {v.modelo}</span>
                      <span style={{color:'#888', fontSize:'12px'}}>
                        {v.propietarioNombre}
                      </span>
                    </div>
                  ))}
                </div>
                {detalle.ubicaciones?.map((u, i) => (
                  <div key={i} style={s.detalleRow}>
                    <span style={s.detalleKey}>
                      {u.tipoUbicacion}
                    </span>
                    <div>
                      <div>{u.direccionReferencia || '—'}</div>
                      <div style={{color:'#888', fontSize:'12px'}}>
                        ({u.latitud?.toFixed(4)}, {u.longitud?.toFixed(4)})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TABLA ─── */}
        <div style={s.tableContainer}>
          {loading ? (
            <div style={s.loading}>Cargando incidentes...</div>
          ) : incidentes.length === 0 ? (
            <div style={s.empty}>
              No se encontraron incidentes registrados
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  {['N° Caso','Tipo','Fecha','SIRDIC',
                    'Vehículo(s)','Responsable',
                    'Estado','Acciones'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidentes.map((inc, i) => (
                  <tr key={inc.id}
                    style={i % 2 === 0 ? s.trEven : s.trOdd}>
                    <td style={s.td}>
                      <span style={s.numeroCaso}>
                        {inc.numeroCaso}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.tipoBadge,
                        background: tipoColor[inc.tipoDelito]
                      }}>
                        {tipoLabel[inc.tipoDelito]}
                      </span>
                    </td>
                    <td style={s.td}>{inc.fechaHecho}</td>
                    <td style={s.td}>
                      {inc.numDenunciaSirdic || '-'}
                    </td>
                    <td style={s.td}>
                      {inc.vehiculos?.map(v => (
                        <span key={v.id} style={s.placaMini}>
                          {v.placa}
                        </span>
                      ))}
                    </td>
                    <td style={s.td}>
                      <span style={{fontSize:'13px'}}>
                        {inc.usuarioResponsable}
                      </span>
                    </td>
                    <td style={s.td}>
                      <select
                        style={{
                          ...s.estadoBadge,
                          background: estadoColor[inc.estado],
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        value={inc.estado}
                        onChange={e =>
                          cambiarEstado(inc.id, e.target.value)
                        }
                      >
                        {ESTADOS_INC.map(e => (
                          <option key={e} value={e}
                            style={{background:'white', color:'#333'}}>
                            {estadoLabel[e]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={s.td}>
                      <button style={s.btnVer}
                        onClick={() => verDetalle(inc.id)}>
                        👁️ Ver
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
  filtros:{ display:'flex', gap:'12px', marginBottom:'20px' },
  select:{
    padding:'10px 16px', borderRadius:'8px',
    border:'2px solid #e0e0e0', fontSize:'14px',
    background:'white', cursor:'pointer', outline:'none'
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
  btnSearch:{
    padding:'10px 20px', background:'#1565c0',
    color:'white', border:'none', borderRadius:'8px',
    cursor:'pointer', fontSize:'14px', fontWeight:'600',
    whiteSpace:'nowrap'
  },
  modalOverlay:{
    position:'fixed', inset:0,
    background:'rgba(0,0,0,0.6)',
    display:'flex', alignItems:'center',
    justifyContent:'center', zIndex:1000,
    overflowY:'auto', padding:'20px'
  },
  modal:{
    background:'white', borderRadius:'16px',
    padding:'32px', width:'100%', maxWidth:'700px',
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
  seccion:{
    marginBottom:'24px', paddingBottom:'20px',
    borderBottom:'1px solid #f0f0f0'
  },
  seccionTitle:{
    fontSize:'13px', fontWeight:'700',
    color:'#1565c0', textTransform:'uppercase',
    letterSpacing:'0.5px', margin:'0 0 16px 0'
  },
  formGrid:{
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:'16px'
  },
  formGroup:{ display:'flex', flexDirection:'column', gap:'6px' },
  label:{ fontSize:'13px', fontWeight:'600', color:'#333' },
  input:{
    padding:'10px 14px', borderRadius:'8px',
    border:'2px solid #e0e0e0', fontSize:'14px',
    outline:'none', width:'100%', boxSizing:'border-box'
  },
  searchVeh:{
    display:'flex', gap:'8px', marginBottom:'12px'
  },
  vehList:{
    display:'flex', flexDirection:'column', gap:'8px'
  },
  vehCard:{
    display:'flex', gap:'12px', alignItems:'center',
    background:'#e3f2fd', padding:'10px 16px',
    borderRadius:'8px', fontSize:'13px', flexWrap:'wrap'
  },
  vehInfo:{ fontWeight:'600', color:'#0d1b2a' },
  vehProp:{ color:'#666', fontSize:'12px' },
  placa:{
    background:'#1565c0', color:'white',
    padding:'3px 10px', borderRadius:'6px',
    fontWeight:'700', fontSize:'13px', letterSpacing:'1px'
  },
  btnQuitar:{
    background:'#ffebee', border:'none',
    color:'#e53935', cursor:'pointer',
    padding:'4px 8px', borderRadius:'6px',
    fontSize:'12px', fontWeight:'700',
    marginLeft:'auto'
  },
  hint:{
    fontSize:'12px', color:'#888',
    margin:'8px 0 0 0', fontStyle:'italic'
  },
  formActions:{
    display:'flex', justifyContent:'flex-end',
    gap:'12px', marginTop:'16px'
  },
  tableContainer:{
    background:'white', borderRadius:'12px',
    boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
    overflow:'hidden'
  },
  loading:{ padding:'40px', textAlign:'center', color:'#666' },
  empty:{ padding:'40px', textAlign:'center', color:'#999' },
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
  numeroCaso:{
    background:'#f3e5f5', color:'#6a1b9a',
    padding:'4px 10px', borderRadius:'6px',
    fontWeight:'700', fontSize:'12px'
  },
  tipoBadge:{
    color:'white', padding:'4px 10px',
    borderRadius:'12px', fontSize:'12px', fontWeight:'700'
  },
  placaMini:{
    background:'#e3f2fd', color:'#1565c0',
    padding:'2px 8px', borderRadius:'4px',
    fontSize:'12px', fontWeight:'700',
    marginRight:'4px', display:'inline-block'
  },
  estadoBadge:{
    padding:'4px 12px', borderRadius:'20px',
    fontSize:'12px', fontWeight:'600'
  },
  btnVer:{
    background:'#e3f2fd', border:'none',
    padding:'6px 12px', borderRadius:'6px',
    cursor:'pointer', fontSize:'12px',
    fontWeight:'600', color:'#1565c0'
  },
  pagination:{
    display:'flex', justifyContent:'center',
    alignItems:'center', gap:'16px',
    marginTop:'20px', padding:'16px'
  },
  btnPag:{
    padding:'8px 20px', borderRadius:'8px',
    border:'2px solid #e0e0e0', background:'white',
    cursor:'pointer', fontSize:'13px', fontWeight:'600'
  },
  paginaInfo:{ color:'#666', fontSize:'14px' },
  detalleGrid:{
    display:'flex', flexDirection:'column', gap:'12px'
  },
  detalleRow:{
    display:'flex', gap:'12px',
    alignItems:'flex-start', padding:'8px 0',
    borderBottom:'1px solid #f5f5f5'
  },
  detalleKey:{
    fontSize:'12px', fontWeight:'700',
    color:'#888', textTransform:'uppercase',
    minWidth:'100px'
  }
};
