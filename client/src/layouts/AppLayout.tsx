import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/common/AppSidebar';
import { TopHeader } from '@/components/common/TopHeader';
import { CommandPalette } from '@/components/common/CommandPalette';

export function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070707] text-white">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#070707]">
        <TopHeader />
        <main className="flex-1 overflow-auto p-6 bg-[#070707] text-white">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
