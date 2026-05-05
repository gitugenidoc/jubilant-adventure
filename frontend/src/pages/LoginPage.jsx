import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("login"); // 'login', 'mfa', 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login form
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [mfaData, setMfaData] = useState({
    code: "",
    tempToken: "",
    email: "",
  });

  // Register form
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.mfaRequired) {
        setMfaData({
          code: "",
          tempToken: data.temporaryToken,
          email: data.email,
        });
        setStep("mfa");
      } else {
        // Store tokens
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on role
        const role = data.user.roles[0];
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "doctor") {
          navigate("/doctor/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temporaryToken: mfaData.tempToken,
          code: mfaData.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "MFA verification failed");
      }

      // Store tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          firstname: registerData.firstname,
          lastname: registerData.lastname,
          organizationId: "HCK", // Default org for now
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful! Please login.");
      setTimeout(() => {
        setStep("login");
        setRegisterData({
          email: "",
          password: "",
          confirmPassword: "",
          firstname: "",
          lastname: "",
        });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Logo size="lg" showText={true} className="justify-center mb-4" />
          <p className="text-gray-600 text-sm">
            Plateforme Hospitalière Numérique
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Login Form */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                placeholder="doctor@genidoc.ma"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Pas encore inscrit?{" "}
                <button
                  type="button"
                  onClick={() => setStep("register")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Créer un compte
                </button>
              </p>
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded">
              <p className="text-xs text-gray-600 font-semibold mb-2">
                Identifiants de démo:
              </p>
              <p className="text-xs text-gray-700">Email: doctor@genidoc.ma</p>
              <p className="text-xs text-gray-700">Password: Doctor@123456</p>
            </div>
          </form>
        )}

        {/* MFA Verification */}
        {step === "mfa" && (
          <form onSubmit={handleMfaVerify} className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-gray-700">Vérification MFA</p>
              <p className="text-sm text-gray-600 mt-2">
                Entrez le code de 6 chiffres
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Code TOTP
              </label>
              <input
                type="text"
                value={mfaData.code}
                onChange={(e) =>
                  setMfaData({ ...mfaData, code: e.target.value })
                }
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? "Vérification..." : "Vérifier"}
            </button>

            <button
              type="button"
              onClick={() => setStep("login")}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              ← Retour à la connexion
            </button>
          </form>
        )}

        {/* Register Form */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={registerData.firstname}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      firstname: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={registerData.lastname}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      lastname: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>

            <button
              type="button"
              onClick={() => setStep("login")}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              ← Retour à la connexion
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
