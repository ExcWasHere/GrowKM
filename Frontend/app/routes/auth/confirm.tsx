import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/confirm";
import { supabase } from "../../lib/supabase";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GrowKM | Email Confirmation" },
    { name: "description", content: "Confirming your email" },
  ];
}

export default function EmailConfirm() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Hash params:', { accessToken, refreshToken, type });

        // If there's an access token in the hash, Supabase has already processed it
        if (accessToken && type === 'signup') {
          // Wait a bit for Supabase to set the session
          await new Promise(resolve => setTimeout(resolve, 500));

          // Check if session is now available
          const { data: { session }, error } = await supabase.auth.getSession();

          console.log('Session after confirmation:', session, error);

          if (error) {
            console.error("Confirmation error:", error);
            setStatus("error");
            setMessage("Gagal mengkonfirmasi email. Link mungkin sudah kadaluarsa.");
            return;
          }

          if (session) {
            setStatus("success");
            setMessage("Email berhasil dikonfirmasi! Anda akan diarahkan ke dashboard...");

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              navigate("/dashboard");
            }, 2000);
          } else {
            setStatus("success");
            setMessage("Email berhasil dikonfirmasi! Silakan login untuk melanjutkan.");

            // Redirect to sign-in after 2 seconds
            setTimeout(() => {
              navigate("/sign-in");
            }, 2000);
          }
        } else {
          // No confirmation token found
          console.log('No valid confirmation token found');
          setStatus("error");
          setMessage("Link konfirmasi tidak valid.");
        }
      } catch (err) {
        console.error("Confirmation error:", err);
        setStatus("error");
        setMessage("Terjadi kesalahan saat mengkonfirmasi email.");
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/latar-belakang.svg')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundSize: "cover",
      }}
    >
      <div className="bg-white/95 rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full backdrop-blur-md">
        <div className="text-center">
          {/* Logo/Brand */}
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="bg-amber-500 bg-clip-text text-transparent">
              GrowKM
            </span>
          </h1>

          {/* Status Icon */}
          <div className="mb-6">
            {status === "loading" && (
              <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto" />
            )}
            {status === "success" && (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            )}
            {status === "error" && (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
          </div>

          {/* Status Message */}
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              {status === "loading" && "Memproses Konfirmasi..."}
              {status === "success" && "Berhasil!"}
              {status === "error" && "Oops!"}
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Action Buttons */}
          {status === "error" && (
            <div className="space-y-3">
              <button
                onClick={() => navigate("/sign-in")}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-all duration-300"
              >
                Kembali ke Login
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-all duration-300"
              >
                Kembali ke Beranda
              </button>
            </div>
          )}

          {status === "loading" && (
            <p className="text-sm text-gray-500">Mohon tunggu sebentar...</p>
          )}
        </div>
      </div>
    </div>
  );
}
