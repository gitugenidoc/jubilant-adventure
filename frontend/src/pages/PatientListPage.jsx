import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function PatientListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }
    searchPatients();
  }, [page, search]);

  const searchPatients = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE}/patients/search?q=${encodeURIComponent(search)}&page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      const data = await response.json();
      setPatients(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    searchPatients();
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Rechercher des Patients</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, Email, Téléphone, ID Patient..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:bg-gray-400 transition"
            >
              {loading ? "Recherche..." : "Rechercher"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/patients/new")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              + Nouveau
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {patients.length === 0 && search ? (
            <div className="p-8 text-center text-gray-600">
              Aucun patient trouvé pour "{search}"
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Nom</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Date de Naissance
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Téléphone
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Médecin
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm text-blue-600">
                        {patient.localId}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {patient.firstName} {patient.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {patient.dateOfBirth
                          ? new Date(patient.dateOfBirth).toLocaleDateString(
                              "fr-FR",
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {patient.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {patient.phoneNumber || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {patient.gpName || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                        >
                          Ouvrir →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Précédent
                  </button>

                  {Array.from(
                    { length: pagination.pages },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-2 rounded border transition ${
                        page === p
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
