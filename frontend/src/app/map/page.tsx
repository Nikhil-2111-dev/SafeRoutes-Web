'use client';
import MapComponent from '@/components/MapComponent';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="flex-grow relative bg-black overflow-hidden flex flex-col">
        {/* Main Content Area */}
        <div className="flex-grow relative h-[calc(100dvh-64px)] w-full">
          {/* Full Screen Map */}
          <div className="absolute inset-0 z-0 bg-black">
            <MapComponent />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
