import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

const supabase = createClient(
  "https://erdconvorgecupvavlwv.supabase.co",
  "your-supabase-anon-key"
);

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  minecraft_username?: string;
  bio?: string;
  avatar_url?: string;
}

interface LoginResponse {
  valid: boolean;
  player_uuid: string;
  player_name: string;
  error?: string;
}

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
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
          `https://erdconvorgecupvavlwv.supabase.co/functions/v1/validate-token?token=${token}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: LoginResponse = await response.json();

        if (!data.valid) {
          setError(data.error || "Invalid or expired token.");
          setLoading(false);
          return;
        }

        // Store player information in localStorage
        localStorage.setItem("player_uuid", data.player_uuid);
        localStorage.setItem("player_name", data.player_name);
        
        // Note: Profile data is handled separately by your existing website
        // The user will need to complete their profile setup through your existing auth flow

        // Create a session or redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard"); // Redirect to dashboard or home
        }, 1000);

      } catch (e) {
        console.error("Login error:", e);
        setError("Failed to validate token. Please try again.");
        setLoading(false);
      }
    };

    validateToken();
  }, [navigate]);

  const handleRetryLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">TokenLink Login</CardTitle>
          <CardDescription>
            Authenticating your Minecraft account...
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">
                  Validating login token...
                </p>
                <p className="text-sm text-muted-foreground">
                  This should only take a moment
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-green-600 dark:text-green-400">
                  Login successful!
                </p>
                <p className="text-sm text-muted-foreground">
                  Welcome, {localStorage.getItem("player_name")}!
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    To get a new login link:
                  </p>
                  <ol className="text-sm text-muted-foreground text-left space-y-1">
                    <li>1. Join the Minecraft server</li>
                    <li>2. Type <code className="bg-background px-1 rounded">/login</code> in chat</li>
                    <li>3. Click the link provided</li>
                  </ol>
                </div>
                
                <Button 
                  onClick={handleRetryLogin}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
