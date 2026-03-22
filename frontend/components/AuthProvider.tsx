"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, hydrateToken, getAuthCookie } from "@/store/slices/authSlice";
import { AppDispatch, RootState } from "@/store";
import { usePathname, useRouter } from "next/navigation";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, token, error } = useSelector((state: RootState) => state.auth);

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedToken = getAuthCookie();
    if (storedToken) {
      dispatch(hydrateToken(storedToken));
      dispatch(fetchCurrentUser());
    }
    setIsHydrated(true); // Marks that the initial client evaluation is done
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrated) return; // Don't redirect until we've checked the local storage

    // If we've finished checking token and the user is NOT authenticated
    if (!loading && !user && !token) {
      if (pathname !== "/login" && pathname !== "/signup") {
        router.push("/login");
      }
    }
    
    // Redirect away from login if already authenticated
    if (!loading && user) {
      if (pathname === "/login" || pathname === "/signup") {
        router.push("/");
      }
    }
  }, [user, loading, token, pathname, router, isHydrated]);

  // If there's a token and we don't have a user yet, we are effectively loading
  const isEffectivelyLoading = loading || (token && !user && !error);

  if (!isHydrated || isEffectivelyLoading) {
    // Only show spinning loader if we actually detected a token and are fetching. 
    // If not hydrated, returning same structural fragment matching SSR is safest.
    if (isEffectivelyLoading) {
      return (
        <div className="h-screen w-full flex items-center justify-center bg-[#EEEEEE]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-[#E8572A] rounded-full animate-spin"></div>
            <div className="text-gray-500 font-medium tracking-wide">Authenticating...</div>
          </div>
        </div>
      );
    }
    // Return null to perfectly mirror Server Side Rendering during the microsecond between SSR and hydration
    if (!user && pathname !== "/login" && pathname !== "/signup") return null;
  }

  // Prevent rendering protected routes until fully checked
  if (!user && pathname !== "/login" && pathname !== "/signup") {
    return null;
  }

  return <>{children}</>;
}
