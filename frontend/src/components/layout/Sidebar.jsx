import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const menu = [
  { path: "/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/mapa", icon: "🗺️", label: "Mapa" },
  { path: "/incidentes", icon: "📋", label: "Incidentes" },
  { path: "/vehiculos", icon: "🚗", label: "Vehículos" },
  { path: "/usuarios", icon: "👥", label: "Usuarios" },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <img
          src="/logo-diprove.png"
          alt="Logo DIPROVE"
          style={styles.logoImg}
        />
        <div>
          <div style={styles.logoTitle}>SIGD-RECVEH</div>
          <div style={styles.logoSub}>DIPROVE — PNP</div>
        </div>
      </div>

      {/* Usuario */}
      <div style={styles.userInfo}>
        <div style={styles.userAvatar}>
          {user?.nombreCompleto?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div style={styles.userTexto}>
          <div style={styles.userName}>{user?.nombreCompleto}</div>
          <div style={styles.userRol}>{user?.rol}</div>
        </div>
      </div>

      {/* Navegación */}
      <nav style={styles.nav}>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={logout} style={styles.logoutBtn}>
        🚪 Cerrar Sesión
      </button>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0d1b2a, #1b2838)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    fontFamily: "system-ui, sans-serif",
    overflowY: "auto",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "24px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoIcon: { fontSize: "28px" },
  logoTitle: {
    color: "white",
    fontWeight: "800",
    fontSize: "14px",
    letterSpacing: "1px",
  },
  logoSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "11px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#1565c0",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },
  userTexto: {
    overflow: "hidden",
  },
  userName: {
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRol: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "11px",
  },
  nav: {
    flex: 1,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.7)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  navItemActive: {
    background: "rgba(255,255,255,0.15)",
    color: "white",
  },
  navIcon: { fontSize: "18px" },
  logoutBtn: {
    margin: "16px",
    padding: "12px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  logoImg: {
  width: '44px',
  height: '44px',
  objectFit: 'contain',
  flexShrink: 0
},
};
