import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  return (
    <div style={styles.app}>
      <Sidebar />
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/stages" element={<StagesPage />} />
        </Routes>
      </main>
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const items = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/accounts", label: "Empresas" },
    { to: "/contacts", label: "Contactos" },
    { to: "/stages", label: "Etapas" },
  ];

  return (
    <aside style={styles.sidebar}>
      <h2 style={{ marginTop: 0 }}>Polygonos 360</h2>
      <p style={{ opacity: 0.75, marginTop: -6 }}>Huella Pro CRM</p>
      <nav style={{ display: "grid", gap: 8, marginTop: 18 }}>
        {items.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                ...styles.navItem,
                ...(active ? styles.navItemActive : {}),
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function DashboardPage() {
  const [apiOk, setApiOk] = useState(null);
  const [sbOk, setSbOk] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then((j) => setApiOk(Boolean(j?.ok)))
      .catch(() => setApiOk(false));

    fetch(`${API_URL}/health/supabase`)
      .then((r) => r.json())
      .then((j) => setSbOk(Boolean(j?.ok)))
      .catch(() => setSbOk(false));
  }, []);

  return (
    <section>
      <h1 style={styles.title}>Dashboard</h1>
      <div style={styles.cards}>
        <Card title="API Backend" value={apiOk === null ? "..." : apiOk ? "Conectada" : "Caída"} />
        <Card title="Supabase" value={sbOk === null ? "..." : sbOk ? "Conectado" : "Error"} />
        <Card title="Estado CRM" value="Base operativa" />
      </div>
    </section>
  );
}

function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [query, setQuery] = useState("");

  async function loadAccounts() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/accounts`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error al cargar empresas");
      setAccounts(json.data || []);
    } catch (e) {
      setError(e?.message ?? "No se pudo conectar con la API");
    } finally {
      setLoading(false);
    }
  }

  async function createAccount(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const res = await fetch(`${API_URL}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industry: industry || null,
          country: country || null,
          website: website || null,
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "No se pudo crear empresa");

      setName("");
      setIndustry("");
      setCountry("");
      setWebsite("");
      await loadAccounts();
    } catch (e) {
      setError(e?.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) =>
      `${a.name} ${a.industry ?? ""} ${a.country ?? ""}`.toLowerCase().includes(q)
    );
  }, [accounts, query]);

  return (
    <section>
      <h1 style={styles.title}>Empresas</h1>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.panel}>
        <h3 style={{ marginTop: 0 }}>Crear empresa</h3>
        <form onSubmit={createAccount} style={styles.formGrid}>
          <Input label="Nombre *" value={name} onChange={setName} required />
          <Input label="Industria" value={industry} onChange={setIndustry} />
          <Input label="País" value={country} onChange={setCountry} />
          <Input label="Website" value={website} onChange={setWebsite} />
          <button style={styles.button} disabled={saving} type="submit">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>

      <div style={styles.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Listado</h3>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar..."
            style={styles.input}
          />
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : filtered.length === 0 ? (
          <p>Sin empresas aún.</p>
        ) : (
          <table width="100%" cellPadding={10} style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #334155" }}>
                <th>Nombre</th>
                <th>Industria</th>
                <th>País</th>
                <th>Website</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #1f2937" }}>
                  <td>{a.name}</td>
                  <td>{a.industry ?? "-"}</td>
                  <td>{a.country ?? "-"}</td>
                  <td>{a.website ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function ContactsPage() {
  return (
    <section>
      <h1 style={styles.title}>Contactos</h1>
      <div style={styles.panel}>
        <p>Módulo en construcción.</p>
      </div>
    </section>
  );
}

function StagesPage() {
  return (
    <section>
      <h1 style={styles.title}>Etapas</h1>
      <div style={styles.panel}>
        <p>Módulo en construcción.</p>
      </div>
    </section>
  );
}

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: 13, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Input({ label, value, onChange, required }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, opacity: 0.9 }}>{label}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </label>
  );
}

const styles = {
  app: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    minHeight: "100vh",
    background: "#0b1220",
    color: "#e5e7eb",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  sidebar: {
    borderRight: "1px solid #1f2937",
    padding: 18,
    background: "#0f172a",
  },
  main: {
    padding: 22,
  },
  navItem: {
    color: "#cbd5e1",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid transparent",
  },
  navItemActive: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#fff",
  },
  title: {
    marginTop: 0,
    marginBottom: 16,
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 12,
  },
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: 14,
  },
  panel: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: 10,
  },
  input: {
    background: "#0b1220",
    border: "1px solid #334155",
    color: "#e5e7eb",
    borderRadius: 8,
    padding: "10px 12px",
  },
  button: {
    gridColumn: "1 / -1",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    background: "#7f1d1d",
    border: "1px solid #b91c1c",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
};