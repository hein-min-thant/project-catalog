import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { NotificationProvider } from "@/hooks/useNotifications";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <NotificationProvider>
        <main className="purple-dark text-foreground bg-background">
          {children}
        </main>
      </NotificationProvider>
    </HeroUIProvider>
  );
}
