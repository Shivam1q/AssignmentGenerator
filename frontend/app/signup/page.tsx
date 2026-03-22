"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import webLogo from "@/app/icons/web/web_logo.svg";

const AVATARS = ["👨‍🏫", "👩‍🏫", "👩‍🔬", "👨‍💻", "👩‍🎓", "📚", "🏫", "🔬"];

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    schoolName: "",
    city: "",
    password: "",
    avatar: AVATARS[0]
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/signup", formData);
      if (response.data.success) {
        dispatch(loginSuccess({ user: response.data.data.user, token: response.data.data.token }));
        router.push("/");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-8 space-y-6">
        <div>
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden relative shadow-sm flex items-center justify-center bg-white border border-gray-100 p-2 mb-6">
            <Image src={webLogo} alt="VedaAI Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">Create your Profile</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Join VedaAI and manage your assignments</p>
        </div>
        
        <form className="mt-6" onSubmit={handleSignup}>
          {error && <div className="mb-4 text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Avatar</label>
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: emoji })}
                    className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all ${
                      formData.avatar === emoji 
                        ? "bg-[#E8572A] border-2 border-orange-600 scale-105 shadow-md" 
                        : "bg-white border border-gray-200 hover:bg-orange-50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E8572A]/50 focus:border-[#E8572A] sm:text-sm"
                placeholder="johndoe123"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E8572A]/50 focus:border-[#E8572A] sm:text-sm"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">School Name</label>
              <input
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E8572A]/50 focus:border-[#E8572A] sm:text-sm"
                placeholder="Delhi Public School"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E8572A]/50 focus:border-[#E8572A] sm:text-sm"
                placeholder="New York"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E8572A]/50 focus:border-[#E8572A] sm:text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#2D2D2D] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D2D2D] transition-all duration-300"
            >
              {loading ? "Creating Profile..." : "Sign Up"}
            </button>
          </div>
          
          <div className="text-center text-sm font-medium mt-6">
            <span className="text-gray-500">Already have an account? </span>
            <Link href="/login" className="text-[#E8572A] hover:text-[#A42511]">Log in Instead</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
