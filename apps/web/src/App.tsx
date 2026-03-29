import { useEffect, useMemo, useState } from "react";

type Account = {
  id: string;
  name: string;
  industry: string | null;
  country: string | null;
  website: string | null;
  created_at: string;
};

const API_URL = "http://localhost:3001";

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");

  async function loadAccounts() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/accounts`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error cargando empresas");
      setAccounts(json.data || []);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo conectar con la API");
    } finally {
      setLoading(false);
    }
  }

  async function createAccount(e: React.FormEvent) {
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
      if (!json.ok) throw new Error(json.error || "No se pudo crear la empresa");

      setName("");
      setIndustry("");
      setCountry("");
      setWebsite("");

      await loadAccounts();
    } catch (e: any) {
      setError(e?.message ?? "Error guardando empresa");
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
      [a.name, a.industry ?? "", a.country ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [accounts, query]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e5e7eb",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #1f2937",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24 }}>Polygonos 360 CRM</h1>
        <span style={{ opacity: 0.8 }}>Módulo: Empresas</span>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        {error && (
          <div
            style={{
              background: "#7f1d1d",
              border: "1px solid #b91c1c",
              padding: 12,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* KPIs */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Card title="Total empresas" value={String(accounts.length)} />
          <Card title="Mostradas (filtro)" value={String(filtered.length)} />
          <Card title="Estado API" value={loading ? "Cargando..." : "Conectada"} />
        </section>

        {/* Form */}
        <section
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Crear empresa</h2>
          <form
            onSubmit={createAccount}
            style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}
          >
            <Input label="Nombre *" value={name} onChange={setName} required />
            <Input label="Industria" value={industry} onChange={setIndustry} />
            <Input label="País" value={country} onChange={setCountry} />
            <Input label="Website" value={website} onChange={setWebsite} />

            <button
              type="submit"
              disabled={saving}
              style={{
                gridColumn: "1 / -1",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {saving ? "Guardando..." : "Guardar empresa"}
            </button>
          </form>
        </section>

        {/* List */}
        <section
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Listado de empresas</h2>
            <input
              placeholder="Buscar por nombre / industria / país"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                minWidth: 280,
                background: "#0b1220",
                border: "1px solid #334155",
                color: "#e5e7eb",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            />
          </div>

          {loading ? (
            <p>Cargando empresas...</p>
          ) : filtered.length === 0 ? (
            <p>No hay empresas para mostrar.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table width="100%" cellPadding={10} style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #334155" }}>
                    <th>Nombre</th>
                    <th>Industria</th>
                    <th>País</th>
                    <th>Website</th>
                    <th>Creada</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #1f2937" }}>
                      <td>{a.name}</td>
                      <td>{a.industry ?? "-"}</td>
                      <td>{a.country ?? "-"}</td>
                      <td>
                        {a.website ? (
                          <a href={a.website} target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>
                            {a.website}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{new Date(a.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, opacity: 0.9 }}>{label}</span>
      <input
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "#0b1220",
          border: "1px solid #334155",
          color: "#e5e7eb",
          borderRadius: 8,
          padding: "10px 12px",
        }}
      />
    </label>
  );
}