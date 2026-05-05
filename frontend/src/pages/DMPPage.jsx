import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function DMPPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState("publications");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publications, setPublications] = useState([]);
  const [accessGrants, setAccessGrants] = useState([]);
  const [accessHistory, setAccessHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    loadDMPData();
  }, [patientId]);

  const loadDMPData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const [pubRes, accessRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/dmp/${patientId}/publications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/dmp/${patientId}/access`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/dmp/${patientId}/access-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (pubRes.ok) {
        const data = await pubRes.json();
        setPublications(Array.isArray(data) ? data : []);
      }

      if (accessRes.ok) {
        const data = await accessRes.json();
        setAccessGrants(Array.isArray(data) ? data : []);
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setAccessHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (grantId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE}/dmp/${patientId}/access/${grantId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        loadDMPData();
      }
    } catch (err) {
      setError(err.message);
    }
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
        Chargement du DMP...
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
            <h1 className="text-3xl font-bold">
              DMP - Dossier Médical Partagé
            </h1>
            <p className="text-gray-600">
              Gestion des documents médicaux partagés
            </p>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b">
            {["publications", "access", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold transition ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {tab === "publications" && "Publications"}
                {tab === "access" && "Accès"}
                {tab === "history" && "Historique"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Publications Tab */}
            {activeTab === "publications" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Documents publiés</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
                    + Publier
                  </button>
                </div>
                <div className="space-y-3">
                  {publications.length > 0 ? (
                    publications.map((pub) => (
                      <div
                        key={pub.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{pub.title}</h3>
                            <p className="text-sm text-gray-600">
                              Type: {pub.documentType}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(pub.publishedAt).toLocaleDateString(
                                "fr-FR",
                              )}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                            {pub.status || "published"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">Aucun document publié</p>
                  )}
                </div>
              </div>
            )}

            {/* Access Tab */}
            {activeTab === "access" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Accès accordés</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
                    + Accorder accès
                  </button>
                </div>
                <div className="space-y-3">
                  {accessGrants.length > 0 ? (
                    accessGrants.map((grant) => (
                      <div
                        key={grant.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">
                              {grant.grantedTo?.email || "Organisation"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Type d'accès: {grant.accessType}
                            </p>
                            <p className="text-xs text-gray-500">
                              Valide jusqu'au{" "}
                              {grant.validUntil
                                ? new Date(grant.validUntil).toLocaleDateString(
                                    "fr-FR",
                                  )
                                : "Indéfini"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRevokeAccess(grant.id)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm"
                          >
                            Révoquer
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">Aucun accès accordé</p>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Historique d'accès
                </h2>
                <div className="space-y-3">
                  {accessHistory.length > 0 ? (
                    accessHistory.map((log, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{log.action}</h3>
                            <p className="text-sm text-gray-600">
                              {log.accessedBy?.email || "Utilisateur"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.accessedAt).toLocaleDateString(
                                "fr-FR",
                              )}{" "}
                              à{" "}
                              {new Date(log.accessedAt).toLocaleTimeString(
                                "fr-FR",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">Aucun accès enregistré</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
