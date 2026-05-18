import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/callback";
import { supabase } from "../../lib/supabase";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GrowKM | Authenticating..." },
    { name: "description", content: "Processing authentication" },
  ];
}

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL params (PKCE flow)
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Error exchanging code:", error);
            alert("Gagal login: " + error.message);
            navigate("/sign-in");
            return;
          }

          if (data.session) {
            console.log("Login successful:", data.session.user);

            // Store user info in localStorage
            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify({
                name: data.session.user.user_metadata?.full_name || data.session.user.email,
                email: data.session.user.email,
                avatar: data.session.user.user_metadata?.avatar_url,
              }));
            }

            // Redirect to dashboard
            navigate("/dashboard");
          }
        } else {
          // Fallback: check if session already exists (hash-based flow)
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error || !session) {
            console.error("No code or session found");
            navigate("/sign-in");
            return;
          }

          if (session) {
            console.log("Login successful:", session.user);

            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify({
                name: session.user.user_metadata?.full_name || session.user.email,
                email: session.user.email,
                avatar: session.user.user_metadata?.avatar_url,
              }));
            }

            navigate("/dashboard");
          }
        }
      } catch (err) {
        console.error("Callback error:", err);
        alert("Terjadi kesalahan saat login");
        navigate("/sign-in");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Memproses login...</p>
        <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}
