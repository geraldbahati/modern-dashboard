import { Menu } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

import LanguageSelector from "./topbar/language-selector";
import ModeToggle from "./topbar/mode-toggle";
import Notifications from "./topbar/notifications";
import SearchBar from "./topbar/search-bar";
import { UserMenu } from "./topbar/user-menu";

export default function TopBar() {
  return (
    <div className="sticky top-0 z-[60] flex h-[5.25rem] items-center px-4 w-full">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 flex h-16 w-full items-center rounded-2xl border px-4 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full size-8"
          >
            <Menu className="size-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="flex items-center gap-2 font-bold">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <div className="size-4 rounded-sm bg-current" />
            </div>
            <span className="hidden md:inline-block">Aniq-ui</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
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
