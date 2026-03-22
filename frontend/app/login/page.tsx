"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import webLogo from "@/app/icons/web/web_logo.svg";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", { username, password });
      if (response.data.success) {
        dispatch(loginSuccess({ user: response.data.data.user, token: response.data.data.token }));
        router.push("/");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-8 space-y-8">
        <div>
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden relative shadow-sm flex items-center justify-center bg-white border border-gray-100 p-2">
            <Image src={webLogo} alt="VedaAI Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to VedaAI</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl">{error}</div>}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E8572A]/50 focus:border-[#E8572A] sm:text-sm transition-all"
                placeholder="johndoe123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E8572A]/50 focus:border-[#E8572A] sm:text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#2D2D2D] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D2D2D] transition-all duration-300"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
          
          <div className="text-center text-sm font-medium">
            <span className="text-gray-500">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-[#E8572A] hover:text-[#A42511]">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
