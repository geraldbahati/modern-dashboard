"use client";

import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "@workspace/auth/client";
import { useWeather } from "../../../../hooks/use-weather";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";

export function HeaderSectionSkeleton() {
  return (
    <DashboardCard className="p-8 border-border h-auto min-h-[208px] rounded-3xl">
      <div className="flex justify-between items-start relative z-10">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />

          <div className="mt-8">
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-14 w-32" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center justify-end gap-2 mb-1">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
      </div>
    </DashboardCard>
  );
}

export default function HeaderSection() {
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState(new Date());
  const { data: session, isPending } = useSession();
  const { weather, loading, error } = useWeather();

  // Get first name from full name
  const displayName = session?.user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = date.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatTime = (date: Date) => {
    return {
      time: date
        .toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/\s*(AM|PM)/, "")
        .trim(),
      period: date
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        })
        .split(" ")[1],
    };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getWeatherIcon = (code: number, isDay: boolean) => {
    // Clear sky
    if (code === 0)
      return isDay ? (
        <Sun className="text-yellow-400 w-6 h-6" />
      ) : (
        <CloudMoon className="text-blue-400 w-6 h-6" />
      );
    // Cloudy
    if (code === 1 || code === 2 || code === 3)
      return isDay ? (
        <CloudSun className="text-yellow-400 w-6 h-6" />
      ) : (
        <CloudMoon className="text-blue-400 w-6 h-6" />
      );
    // Fog
    if (code === 45 || code === 48)
      return <CloudFog className="text-gray-400 w-6 h-6" />;
    // Drizzle / Rain
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
      return <CloudRain className="text-blue-400 w-6 h-6" />;
    // Freezing Rain / Snow
    if ([56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(code))
      return <CloudSnow className="text-white w-6 h-6" />;
    // Thunderstorm
    if ([95, 96, 99].includes(code))
      return <CloudLightning className="text-yellow-400 w-6 h-6" />;

    return <Cloud className="text-gray-400 w-6 h-6" />;
  };

  const timeObj = formatTime(date);

  // Prevent hydration mismatch by rendering a placeholder or static content initially
  // However, for a clock, it's better to render nothing or a skeleton until mounted
  // to avoid the flash of incorrect time.
  if (!mounted || isPending) {
    return <HeaderSectionSkeleton />;
  }

  return (
    <DashboardCard className="border-border h-auto min-h-[208px] rounded-3xl">
      <div className="flex justify-between items-start relative z-10 p-3">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-gray-400 text-sm">
            Ready to make today productive! 🚀
          </p>

          <div className="mt-8">
            <h2 className="text-5xl font-bold">
              {timeObj.time}{" "}
              <span className="text-xl font-normal text-gray-400">
                {timeObj.period}
              </span>
            </h2>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            {loading ? (
              <Skeleton className="w-6 h-6 rounded-full" />
            ) : error ? (
              <Cloud className="text-muted-foreground w-6 h-6" />
            ) : (
              weather && getWeatherIcon(weather.weatherCode, weather.isDay)
            )}
            <span className="text-4xl font-bold">
              {loading ? (
                <Skeleton className="h-10 w-16 inline-block" />
              ) : weather ? (
                `${weather.temperature}°C`
              ) : (
                "--"
              )}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {loading ? (
              <Skeleton className="h-4 w-12 inline-block" />
            ) : weather ? (
              weather.condition
            ) : (
              "Unavailable"
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {loading ? (
              <Skeleton className="h-3 w-16 inline-block" />
            ) : weather ? (
              weather.location
            ) : (
              "Unknown Location"
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(date)}
          </p>
        </div>
      </div>

      {/* Background Gradient Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
    </DashboardCard>
  );
}
