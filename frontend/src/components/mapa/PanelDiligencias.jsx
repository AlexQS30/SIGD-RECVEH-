import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function PanelDiligencias({ incidenteId, numeroCaso }) {
  const [diligencias, setDiligencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nueva, setNueva] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (incidenteId) cargarDiligencias();
  }, [incidenteId]);

  const cargarDiligencias = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/diligencias/incidente/${incidenteId}`);
      setDiligencias(data);
    } catch {
      setError("Error al cargar diligencias");
    } finally {
      setLoading(false);
    }
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nueva.trim()) return;
    setGuardando(true);
    setError("");
    try {
      await api.post("/diligencias", {
        incidenteId,
        descripcion: nueva.trim(),
      });
      setNueva("");
      cargarDiligencias();
    } catch {
      setError("Error al registrar diligencia");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Eliminar esta diligencia?")) return;
    try {
      await api.delete(`/diligencias/${id}`);
      cargarDiligencias();
    } catch {
      setError("Error al eliminar diligencia");
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={s.contenedor}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h3 style={s.titulo}>📝 Diligencias</h3>
          <p style={s.subtitulo}>Novedades del caso {numeroCaso}</p>
        </div>
        <span style={s.badge}>
          {diligencias.length} registro{diligencias.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Formulario nueva diligencia */}
      <form onSubmit={handleAgregar} style={s.form}>
        <textarea
          style={s.textarea}
          placeholder="Escribe la novedad o avance del caso... (Ej: Se realizó reconocimiento del lugar de los hechos. Se tomaron fotografías y se entrevistó a testigos.)"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          rows={3}
        />
        {error && <div style={s.alertError}>{error}</div>}
        <div style={s.formFooter}>
          <span style={s.hint}>
            {nueva.length > 0
              ? `${nueva.length} caracteres`
              : "💡 Registra cada acción investigativa realizada"}
          </span>
          <button
            type="submit"
            style={{
              ...s.btnAgregar,
              opacity: !nueva.trim() || guardando ? 0.6 : 1,
              cursor: !nueva.trim() || guardando ? "not-allowed" : "pointer",
            }}
            disabled={!nueva.trim() || guardando}
          >
            {guardando ? "⏳ Guardando..." : "➕ Registrar Diligencia"}
          </button>
        </div>
      </form>

      {/* Lista de diligencias */}
      <div style={s.lista}>
        {loading ? (
          <div style={s.loading}>Cargando diligencias...</div>
        ) : diligencias.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📋</div>
            <div>No hay diligencias registradas para este caso</div>
            <div style={s.emptyHint}>Registra la primera novedad arriba</div>
          </div>
        ) : (
          diligencias.map((d, i) => (
            <div key={d.id} style={s.itemDiligencia}>
              {/* Línea de tiempo */}
              <div style={s.timeline}>
                <div
                  style={{
                    ...s.timelineDot,
                    background: i === 0 ? "#1565c0" : "#90a4ae",
                  }}
                />
                {i < diligencias.length - 1 && <div style={s.timelineLine} />}
              </div>

              {/* Contenido */}
              <div style={s.itemContenido}>
                <div style={s.itemHeader}>
                  <div style={s.itemMeta}>
                    <span style={s.itemUsuario}>👤 {d.usuario}</span>
                    <span style={s.itemFecha}>
                      🕐 {formatFecha(d.fechaRegistro)}
                    </span>
                    {i === 0 && <span style={s.badgeNuevo}>Última</span>}
                  </div>
                  <button
                    style={s.btnEliminar}
                    onClick={() => handleEliminar(d.id)}
                    title="Eliminar diligencia"
                  >
                    🗑️
                  </button>
                </div>
                <p style={s.itemDescripcion}>{d.descripcion}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const s = {
  contenedor: {
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    background: "linear-gradient(135deg, #0d1b2a, #1b2838)",
    color: "white",
  },
  titulo: {
    fontSize: "16px",
    fontWeight: "800",
    margin: "0 0 4px 0",
    color: "white",
  },
  subtitulo: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
    margin: 0,
  },
  badge: {
    background: "rgba(255,255,255,0.2)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },
  form: {
    padding: "20px 24px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "2px solid #e0e0e0",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    fontFamily: "system-ui, sans-serif",
    lineHeight: "1.5",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  alertError: {
    background: "#ffebee",
    color: "#c62828",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    marginTop: "8px",
  },
  formFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },
  hint: {
    fontSize: "12px",
    color: "#888",
    fontStyle: "italic",
  },
  btnAgregar: {
    padding: "10px 20px",
    background: "#1565c0",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    transition: "opacity 0.2s",
  },
  lista: {
    padding: "16px 24px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  loading: {
    padding: "24px",
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
  },
  empty: {
    padding: "32px",
    textAlign: "center",
    color: "#999",
  },
  emptyIcon: {
    fontSize: "36px",
    marginBottom: "8px",
  },
  emptyHint: {
    fontSize: "12px",
    color: "#bbb",
    marginTop: "4px",
  },
  itemDiligencia: {
    display: "flex",
    gap: "0",
    marginBottom: "4px",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: "16px",
    paddingTop: "4px",
  },
  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "4px",
  },
  timelineLine: {
    width: "2px",
    flex: 1,
    background: "#e0e0e0",
    marginTop: "4px",
    minHeight: "20px",
  },
  itemContenido: {
    flex: 1,
    background: "#f8f9fa",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "12px",
    border: "1px solid #f0f0f0",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  itemMeta: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  itemUsuario: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#1565c0",
  },
  itemFecha: {
    fontSize: "11px",
    color: "#888",
  },
  badgeNuevo: {
    background: "#e3f2fd",
    color: "#1565c0",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "700",
  },
  btnEliminar: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    padding: "2px 6px",
    borderRadius: "4px",
    opacity: 0.6,
    transition: "opacity 0.2s",
  },
  itemDescripcion: {
    fontSize: "13px",
    color: "#333",
    lineHeight: "1.6",
    margin: 0,
    whiteSpace: "pre-wrap",
  },
};
