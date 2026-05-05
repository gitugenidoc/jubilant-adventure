import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function ConsentPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeConsents, setActiveConsents] = useState([]);
  const [revokedConsents, setRevokedConsents] = useState([]);
  const [showNewConsentForm, setShowNewConsentForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "research",
    category: "health-research",
    description: "",
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    loadConsents();
  }, [patientId]);

  const loadConsents = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const [activeRes, revokedRes] = await Promise.all([
        fetch(`${API_BASE}/consent/${patientId}/consents?status=active`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/consent/${patientId}/consents?status=revoked`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveConsents(Array.isArray(data) ? data : []);
      }

      if (revokedRes.ok) {
        const data = await revokedRes.json();
        setRevokedConsents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE}/consent/${patientId}/consents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setShowNewConsentForm(false);
        loadConsents();
      } else {
        setError("Erreur lors de la création du consentement");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConsent = async (consentId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir révoquer ce consentement?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE}/consent/${patientId}/consents/${consentId}/revoke`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: "Révoqué par le patient",
          }),
        },
      );

      if (response.ok) {
        loadConsents();
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
        Chargement des consentements...
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
            <h1 className="text-3xl font-bold">Gestion des Consentements</h1>
            <p className="text-gray-600">
              Gérez vos consentements pour l'utilisation de vos données
            </p>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="p-6">
            {/* Active Consents */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Consentements actifs</h2>
                <button
                  onClick={() => setShowNewConsentForm(!showNewConsentForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                >
                  {showNewConsentForm ? "Annuler" : "+ Nouveau consentement"}
                </button>
              </div>

              {/* New Consent Form */}
              {showNewConsentForm && (
                <div className="mb-6 p-6 bg-gray-50 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Créer un nouveau consentement
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Type
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="research">Recherche</option>
                          <option value="treatment">Traitement</option>
                          <option value="marketing">Marketing</option>
                          <option value="secondary-use">
                            Utilisation secondaire
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Catégorie
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="health-research">
                            Recherche médicale
                          </option>
                          <option value="clinical-trial">Essai clinique</option>
                          <option value="epidemiology">Épidémiologie</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Valide à partir du
                        </label>
                        <input
                          type="date"
                          value={formData.validFrom}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              validFrom: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Valide jusqu'au
                        </label>
                        <input
                          type="date"
                          value={formData.validUntil}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              validUntil: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                    >
                      Créer
                    </button>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                {activeConsents.length > 0 ? (
                  activeConsents.map((consent) => (
                    <div
                      key={consent.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {consent.type}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {consent.description || consent.category}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Accordé le{" "}
                            {new Date(consent.grantedAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRevokeConsent(consent.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Révoquer
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Aucun consentement actif</p>
                )}
              </div>
            </div>

            {/* Revoked Consents */}
            {revokedConsents.length > 0 && (
              <div className="border-t pt-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Consentements révoqués
                </h2>
                <div className="space-y-3">
                  {revokedConsents.map((consent) => (
                    <div
                      key={consent.id}
                      className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 opacity-75"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-600">
                          {consent.type}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Révoqué le{" "}
                          {consent.revokedAt
                            ? new Date(consent.revokedAt).toLocaleDateString(
                                "fr-FR",
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
