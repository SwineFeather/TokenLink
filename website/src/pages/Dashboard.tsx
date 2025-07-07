
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Calendar, 
  Clock, 
  Mail, 
  LogOut, 
  Trophy,
  Settings,
  AlertCircle,
  ExternalLink,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SettingsModal from "@/components/SettingsModal";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  minecraft_username?: string;
  bio?: string;
  avatar_url?: string;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [needsEmailSetup, setNeedsEmailSetup] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    const tokenLinkProfileId = localStorage.getItem("tokenlink_profile_id");
    const playerUuid = localStorage.getItem("player_uuid");
    const playerName = localStorage.getItem("player_name");
    const profileData = localStorage.getItem("profile");

    console.log('Dashboard loading with TokenLink data:', {
      hasProfileId: !!tokenLinkProfileId,
      hasUuid: !!playerUuid,
      hasName: !!playerName,
      hasProfile: !!profileData
    });

    if (!playerUuid || !playerName) {
      console.log('No TokenLink data found, redirecting to login');
      navigate("/");
      return;
    }

    if (profileData) {
      try {
        const parsedProfile = JSON.parse(profileData);
        console.log('Loaded TokenLink profile:', parsedProfile);
        setProfile(parsedProfile);
        
        // Check if user needs to set up email/password
        const isTokenLinkEmail = parsedProfile.email?.includes('@tokenlink.local');
        setNeedsEmailSetup(isTokenLinkEmail);
      } catch (e) {
        console.error("Error parsing profile data:", e);
      }
    } else {
      // Create basic profile from stored data
      const basicProfile = {
        id: tokenLinkProfileId || playerUuid,
        email: playerName + '@tokenlink.local',
        full_name: playerName,
        role: 'member',
        minecraft_username: playerName
      };
      setProfile(basicProfile);
      setNeedsEmailSetup(true);
    }

    setLoading(false);
  }, [navigate]);

  const handleLogout = async () => {
    console.log('Logging out TokenLink user');
    localStorage.removeItem("tokenlink_profile_id");
    localStorage.removeItem("player_uuid");
    localStorage.removeItem("player_name");
    localStorage.removeItem("profile");
    
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    
    navigate("/");
  };

  const handleViewProfile = () => {
    const playerName = localStorage.getItem("player_name");
    if (playerName) {
      navigate(`/community?player=${encodeURIComponent(playerName)}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const playerName = localStorage.getItem("player_name") || "Unknown Player";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {playerName}!
          </h2>
          <p className="text-muted-foreground">
            Manage your account and explore the community
          </p>
        </div>

        {/* Account Setup Alert */}
        {needsEmailSetup && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Complete your account setup by adding an email and password for enhanced security.</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  Setup Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Minecraft Username</label>
                      <p className="text-lg font-semibold mt-1">{profile.minecraft_username || profile.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm mt-1 font-mono">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <div className="mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {profile.role}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                      <div className="flex items-center mt-1">
                        <Shield className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-green-600">TokenLink</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  onClick={handleViewProfile}
                >
                  <User className="w-4 h-4 mr-2" />
                  View My Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/community")}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Community
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/forum")}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Forum
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">Strengthen your account security:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Add a secure email address</li>
                    <li>• Set a strong password</li>
                    <li>• Update your profile information</li>
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        open={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

export default Dashboard;
