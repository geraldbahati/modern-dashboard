import { Button } from "@workspace/ui/components/button";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Separator } from "@workspace/ui/components/separator";

import LanguageSelector from "./topbar/language-selector";
import ModeToggle from "./topbar/mode-toggle";
import Notifications from "./topbar/notifications";
import SearchBar from "./topbar/search-bar";
import { UserMenu } from "./topbar/user-menu";

export function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex h-[5.25rem] items-center px-4 w-full pointer-events-none bg-background/80 backdrop-blur-md">
      <header className="bg-sidebar relative flex h-16 w-full items-center rounded-2xl border px-4 shadow-sm overflow-hidden pointer-events-auto">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 20,
            background:
              "radial-gradient(800px 2900px at 0% 0%, rgba(205, 205, 205, 0.04) 0%, rgba(205, 205, 205, 0) 30%, transparent 70%)",
          }}
        />
        <div className="relative z-30 flex items-center gap-2 md:gap-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 font-bold">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <div className="size-4 rounded-sm bg-current" />
            </div>
            <span className="hidden md:inline-block">Aniq-ui</span>
          </div>
        </div>

        <div className="relative z-30 ml-auto flex items-center gap-2 md:gap-4">
          <SearchBar className="hidden md:block" />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ModeToggle />
            <Notifications />
            <Separator orientation="vertical" className="h-6" />
            <UserMenu />
          </div>
        </div>
      </header>
    </div>
  );
}
