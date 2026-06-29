import { PropertySidebar } from "@/components/property-sidebar";
import { MapComponent } from "@/components/map-component";

export default function HomePage() {
  return (
    <div className="flex h-[calc(90vh)] overflow-hidden">
      {/* Sidebar - Left side */}
      <div className="w-96 border-r bg-background">
        <PropertySidebar />
      </div>

      {/* Map - Right side, takes up remaining space */}
      <div className="flex-1">
        <MapComponent />
      </div>
    </div>
  );
}
