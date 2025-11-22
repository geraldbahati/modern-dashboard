"use client";

import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import {
  Map,
  MapLayers,
  MapTileLayer,
  MapMarker,
  MapZoomControl,
} from "@workspace/ui/components/map";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Plus, Minus, Globe } from "lucide-react";

function PulseIcon() {
  return (
    <div className="relative flex h-4 w-4">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
    </div>
  );
}

export default function ActivityMap() {
  return (
    <DashboardCard className="p-0 overflow-hidden flex flex-col h-full lg:min-h-[600px]">
      <div className="p-6 flex items-center justify-between z-10 relative pointer-events-none">
        <div className="pointer-events-auto">
          <h3 className="text-base font-semibold text-foreground">
            User Activity Map
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time user engagement worldwide
          </p>
        </div>
        <div className="pointer-events-auto">
          <Button
            variant="link"
            className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
          >
            View Details
          </Button>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full min-h-0">
        <Map
          center={[20, 0]}
          zoom={2}
          className="h-full w-full z-0 object-cover"
          minZoom={2}
          maxZoom={10}
        >
          <MapLayers>
            <MapTileLayer
              name="Dark"
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
          </MapLayers>

          <MapZoomControl className="top-4 right-4 left-auto" />

          {/* Example Marker - Spain/France border area roughly based on image */}
          <MapMarker
            position={[40.4168, -3.7038]} // Madrid
            icon={<PulseIcon />}
          />

          {/* Example Marker - New York */}
          <MapMarker position={[40.7128, -74.006]} icon={<PulseIcon />} />

          {/* Example Marker - Tokyo */}
          <MapMarker position={[35.6762, 139.6503]} icon={<PulseIcon />} />
        </Map>

        {/* Overlay Gradient for "premium" look matching the design source code hint */}
        <div
          className="absolute inset-0 pointer-events-none z-[400]"
          style={{
            background:
              "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%)",
          }}
        />
      </div>
    </DashboardCard>
  );
}

export function ActivityMapSkeleton() {
  return (
    <DashboardCard className="p-0 overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="p-6 flex items-center justify-between z-10 relative">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex-1 relative w-full h-full min-h-0 bg-muted/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </DashboardCard>
  );
}
