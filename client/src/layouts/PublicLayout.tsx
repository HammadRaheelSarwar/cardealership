import { Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center relative overflow-hidden">
      {/* Background radial gold glow */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#D4AF37]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/8 rounded-full blur-3xl pointer-events-none" />
      <Outlet />
    </div>
  );
}
