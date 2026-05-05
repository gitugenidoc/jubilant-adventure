import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function DPIPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [activeTab, setActiveTab] = useState("encounters");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dpiData, setDpiData] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    loadDPIData();
  }, [patientId]);

  const loadDPIData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const [summaryRes, encountersRes] = await Promise.all([
        fetch(`${API_BASE}/dpi/${patientId}/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/dpi/${patientId}/encounters`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        setDpiData(summary);
        setDocuments(summary.documents || []);
      }

      if (encountersRes.ok) {
        const data = await encountersRes.json();
        setEncounters(data.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        Chargement du DPI...
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
            <h1 className="text-3xl font-bold">DPI - Dossier Patient</h1>
            <p className="text-gray-600">Patient ID: {patientId}</p>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b">
            {["encounters", "documents", "diagnoses", "timeline"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold transition ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {tab === "encounters" && "Consultations"}
                {tab === "documents" && "Documents"}
                {tab === "diagnoses" && "Diagnostics"}
                {tab === "timeline" && "Chronologie"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Encounters Tab */}
            {activeTab === "encounters" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Consultations</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
                    + Nouvelle
                  </button>
                </div>
                <div className="space-y-3">
                  {encounters.length > 0 ? (
                    encounters.map((encounter) => (
                      <div
                        key={encounter.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold">{encounter.type}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(encounter.startDate).toLocaleDateString(
                                "fr-FR",
                              )}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {encounter.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">Aucune consultation</p>
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Documents</h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold">
                    + Télécharger
                  </button>
                </div>
                <div className="space-y-3">
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-semibold">{doc.title}</h3>
                          <p className="text-sm text-gray-600">{doc.type}</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 font-semibold">
                          Voir
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">Aucun document</p>
                  )}
                </div>
              </div>
            )}

            {/* Diagnoses Tab */}
            {activeTab === "diagnoses" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Diagnostics</h2>
                {dpiData?.diagnoses && dpiData.diagnoses.length > 0 ? (
                  <div className="space-y-3">
                    {dpiData.diagnoses.map((diag) => (
                      <div
                        key={diag.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <h3 className="font-semibold">{diag.description}</h3>
                        <p className="text-sm text-gray-600">
                          Code: {diag.code}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Aucun diagnostic</p>
                )}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === "timeline" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Chronologie</h2>
                <p className="text-gray-600">
                  Vue chronologique des événements du DPI
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
