import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const playerUuid = localStorage.getItem("player_uuid");
    const playerName = localStorage.getItem("player_name");
    const profileData = localStorage.getItem("profile");

    if (!playerUuid || !playerName) {
      navigate("/login");
      return;
    }

    if (profileData) {
      try {
        setProfile(JSON.parse(profileData));
      } catch (e) {
        console.error("Error parsing profile data:", e);
      }
    }

    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("player_uuid");
    localStorage.removeItem("player_name");
    localStorage.removeItem("profile");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">TokenLink Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Welcome, {localStorage.getItem("player_name")}!
              </h2>
              
              {profile && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Player UUID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{profile.player_uuid}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Player Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile.player_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(profile.last_login).toLocaleString()}
                    </dd>
                  </div>
                  {profile.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profile.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">View Profile</span>
                  </button>
                  <button className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">Server Status</span>
                  </button>
                  <button className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 