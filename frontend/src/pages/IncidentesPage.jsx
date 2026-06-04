import Sidebar from '../components/layout/Sidebar';
export default function IncidentesPage() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', padding: '32px', flex: 1 }}>
        <h1>Gestión de Incidentes</h1>
        <p>Módulo en construcción...</p>
      </main>
    </div>
  );
}