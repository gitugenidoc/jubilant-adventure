import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function AuditPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("logs");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [breakGlassLogs, setBreakGlassLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: "",
    resourceType: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.roles?.includes("admin")) {
      navigate("/dashboard");
      return;
    }

    loadAuditData();
  }, [filters]);

  const loadAuditData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();

      if (filters.action) params.append("action", filters.action);
      if (filters.resourceType)
        params.append("resourceType", filters.resourceType);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const [logsRes, securityRes, breakGlassRes] = await Promise.all([
        fetch(`${API_BASE}/audit/logs?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/audit/security-events`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/audit/break-glass`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.data || []);
      }

      if (securityRes.ok) {
        const data = await securityRes.json();
        setSecurityEvents(data.data || []);
      }

      if (breakGlassRes.ok) {
        const data = await breakGlassRes.json();
        setBreakGlassLogs(data.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Chargement des logs d'audit...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div
            className="cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <Logo size="md" showText={true} />
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Title */}
          <div className="border-b p-6">
            <h1 className="text-3xl font-bold">Audit & Sécurité</h1>
            <p className="text-gray-600">
              Consultez les logs d'activité et les événements de sécurité
            </p>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="border-b p-6 bg-gray-50">
            <h3 className="font-semibold mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <select
                  name="action"
                  value={filters.action}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes</option>
                  <option value="login">Connexion</option>
                  <option value="logout">Déconnexion</option>
                  <option value="view">Consultation</option>
                  <option value="create">Création</option>
                  <option value="update">Modification</option>
                  <option value="delete">Suppression</option>
                  <option value="export">Export</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type de ressource
                </label>
                <select
                  name="resourceType"
                  value={filters.resourceType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous</option>
                  <option value="patient">Patient</option>
                  <option value="encounter">Consultation</option>
                  <option value="document">Document</option>
                  <option value="consent">Consentement</option>
                  <option value="user">Utilisateur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date début
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {["logs", "security", "breakglass"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold transition ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {tab === "logs" && `Logs (${logs.length})`}
                {tab === "security" &&
                  `Événements sécurité (${securityEvents.length})`}
                {tab === "breakglass" &&
                  `Accès d'urgence (${breakGlassLogs.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Logs Tab */}
            {activeTab === "logs" && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">Timestamp</th>
                        <th className="px-4 py-2 text-left">Utilisateur</th>
                        <th className="px-4 py-2 text-left">Action</th>
                        <th className="px-4 py-2 text-left">Ressource</th>
                        <th className="px-4 py-2 text-left">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length > 0 ? (
                        logs.map((log) => (
                          <tr
                            key={log.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-4 py-2 text-xs">
                              {new Date(log.timestamp).toLocaleString("fr-FR")}
                            </td>
                            <td className="px-4 py-2">
                              {log.user?.email || log.userId}
                            </td>
                            <td className="px-4 py-2 font-semibold">
                              {log.action}
                            </td>
                            <td className="px-4 py-2">
                              {log.resourceType}: {log.resourceId}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  log.status === "success"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-4 py-4 text-center text-gray-600"
                          >
                            Aucun log trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Security Events Tab */}
            {activeTab === "security" && (
              <div className="space-y-3">
                {securityEvents.length > 0 ? (
                  securityEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`border rounded-lg p-4 ${
                        event.severity === "critical"
                          ? "bg-red-50 border-red-300"
                          : event.severity === "high"
                            ? "bg-orange-50 border-orange-300"
                            : "bg-gray-50 border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{event.eventType}</h3>
                          <p className="text-sm text-gray-600">
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(event.reportedAt).toLocaleString("fr-FR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded text-sm font-semibold ${
                              event.severity === "critical"
                                ? "bg-red-200 text-red-800"
                                : event.severity === "high"
                                  ? "bg-orange-200 text-orange-800"
                                  : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {event.severity}
                          </span>
                          <p className="text-xs mt-2">Status: {event.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Aucun événement de sécurité</p>
                )}
              </div>
            )}

            {/* Break-Glass Logs Tab */}
            {activeTab === "breakglass" && (
              <div className="space-y-3">
                {breakGlassLogs.length > 0 ? (
                  breakGlassLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 bg-yellow-50 hover:bg-yellow-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Accès d'urgence</h3>
                          <p className="text-sm text-gray-600">
                            Raison: {log.reason}
                          </p>
                          <p className="text-sm text-gray-600">
                            Justification: {log.justification}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(log.accessedAt).toLocaleString("fr-FR")}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            log.status === "pending-review"
                              ? "bg-yellow-200 text-yellow-800"
                              : log.status === "approved"
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Aucun accès d'urgence</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
