import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const patientResponse = await fetch(`${API_BASE}/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!patientResponse.ok) {
        throw new Error("Patient non trouvé");
      }

      const patientData = await patientResponse.json();
      setPatient(patientData);
      setFormData({
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
        phoneNumber: patientData.phoneNumber,
        address: patientData.address,
      });

      // Load timeline
      const timelineResponse = await fetch(
        `${API_BASE}/patients/${id}/timeline?limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json();
        setTimeline(timelineData.timeline || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE}/patients/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      const updated = await response.json();
      setPatient(updated);
      setEditMode(false);
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
        Chargement du patient...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-screen">
        Patient non trouvé
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Patient Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-600 mt-2">
                ID:{" "}
                <span className="font-mono font-bold text-blue-600">
                  {patient.localId}
                </span>
              </p>
              <p className="text-gray-600">
                DOB: {new Date(patient.dateOfBirth).toLocaleDateString("fr-FR")}{" "}
                ({patient.gender})
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/dpi/${id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition text-sm"
              >
                📁 DPI
              </button>
              <button
                onClick={() => navigate(`/dmp/${id}`)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition text-sm"
              >
                📄 DMP
              </button>
              <button
                onClick={() => navigate(`/consent/${id}`)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold transition text-sm"
              >
                ✓ Consentements
              </button>
              <button
                onClick={() => setEditMode(!editMode)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition"
              >
                {editMode ? "Annuler" : "✏️ Modifier"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex border-b">
            {["info", "identifiants", "contacts", "historique"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 font-semibold transition ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab === "info" && "Informations"}
                {tab === "identifiants" && "Identifiants"}
                {tab === "contacts" && "Contacts"}
                {tab === "historique" && "Historique"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Info Tab */}
            {activeTab === "info" && (
              <div className="space-y-4">
                {editMode ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Adresse
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                      />
                    </div>

                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Email</p>
                        <p className="text-lg font-semibold">
                          {patient.email || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Téléphone</p>
                        <p className="text-lg font-semibold">
                          {patient.phoneNumber || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Adresse</p>
                        <p className="text-lg font-semibold">
                          {patient.address || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">
                          Médecin Traitant
                        </p>
                        <p className="text-lg font-semibold">
                          {patient.gpName || "-"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Identifiants Tab */}
            {activeTab === "identifiants" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Identifiants</h3>
                <div className="space-y-2">
                  {patient.identifiers?.map((id) => (
                    <div
                      key={id.id}
                      className="p-4 border border-gray-200 rounded"
                    >
                      <p className="text-sm text-gray-600">
                        {id.type.toUpperCase()}
                      </p>
                      <p className="text-lg font-mono font-bold">{id.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === "contacts" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Contacts d'Urgence</h3>
                {patient.contacts?.length > 0 ? (
                  <div className="space-y-4">
                    {patient.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-4 border border-gray-200 rounded"
                      >
                        <p className="font-semibold">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {contact.relationship}
                        </p>
                        <p className="text-sm">{contact.phoneNumber}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Aucun contact d'urgence enregistré
                  </p>
                )}
              </div>
            )}

            {/* Historique Tab */}
            {activeTab === "historique" && (
              <div>
                <h3 className="text-xl font-bold mb-4">Historique Clinique</h3>
                {timeline.length > 0 ? (
                  <div className="space-y-4">
                    {timeline.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border-l-4 border-blue-600 bg-blue-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg">
                              {event.title}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {event.description}
                            </p>
                            {event.practitioner && (
                              <p className="text-sm text-gray-500 mt-1">
                                Médecin: {event.practitioner}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Aucun événement clinique enregistré
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/patients")}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Retour à la liste des patients
          </button>
        </div>
      </main>
    </div>
  );
}
