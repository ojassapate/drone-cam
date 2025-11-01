"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { DroneStreamProvider } from "@/context/DroneStreamContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DroneStreamProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </DroneStreamProvider>
  );
}
