import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
  "https://your-supabase-project.supabase.co",
  "your-supabase-anon-key"
);

interface Profile {
  id: number;
  player_uuid: string;
  player_name: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  last_login: string;
  is_active: boolean;
}

interface LoginResponse {
  valid: boolean;
  player_uuid: string;
  player_name: string;
  profile?: Profile;
  error?: string;
}

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setError("No token provided.");
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://your-supabase-project.supabase.co/functions/v1/validate-token?token=${token}`
        );
        const data: LoginResponse = await response.json();

        if (!data.valid) {
          setError(data.error || "Invalid or expired token.");
          setLoading(false);
          return;
        }

        // Store player information in localStorage
        localStorage.setItem("player_uuid", data.player_uuid);
        localStorage.setItem("player_name", data.player_name);
        
        if (data.profile) {
          localStorage.setItem("profile", JSON.stringify(data.profile));
        }

        // Create a session or redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard"); // Redirect to dashboard or home
        }, 1000);

      } catch (e) {
        setError("Failed to validate token. Please try again.");
        setLoading(false);
      }
    };

    validateToken();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Validating login token...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-500 text-2xl mb-4">⚠️</div>
            <p className="text-red-500 font-medium">{error}</p>
            <p className="text-gray-600 mt-2 text-sm">
              Please try using the /login command in-game again.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-green-500 text-2xl mb-4">✅</div>
            <p className="text-green-600 font-medium">Login successful!</p>
            <p className="text-gray-600 mt-2 text-sm">
              Redirecting to dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;