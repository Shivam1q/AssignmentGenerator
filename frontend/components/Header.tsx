import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logoutUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<any>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <header className="hidden md:flex items-center justify-between px-8 py-4 bg-transparent w-full">
      <div className="flex items-center space-x-3 text-text-secondary">
        <button onClick={() => router.push("/")} className="p-1 hover:bg-gray-200 rounded-full transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center space-x-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="text-sm font-medium">Assignment</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative p-1 text-text-secondary hover:text-text-primary transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-0.5 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-3 group relative cursor-pointer hover:bg-gray-100 p-1.5 rounded-full pr-3 transition">
          <div className="w-8 h-8 bg-orange-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200">
             <span className="text-sm">{user?.avatar || '👨‍🏫'}</span>
          </div>
          <span className="text-sm font-bold text-text-primary">{user?.name || 'Guest'}</span>
          
          <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <button 
              onClick={handleLogout}
              className="bg-white border border-gray-200 px-5 py-2.5 shadow-lg rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 w-full text-center"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
