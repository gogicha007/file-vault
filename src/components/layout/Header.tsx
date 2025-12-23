import { Link } from "@tanstack/react-router";
import LocaleSwitcher from "../controls/locale-switcher/LocaleSwitcher";
import MainMenu from "./MainMenu";
import { FolderSearch } from "lucide-react";
import AuthBar from "../controls/auth-bar/AuthBar";
import ThemeSwitcher from "../controls/theme-switcher/ThemeSwitcher";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to={"/"} className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-2">
              <FolderSearch className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FileVault
            </span>
          </Link>
          <MainMenu />
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeSwitcher />
          <AuthBar />
        </div>
      </div>
    </header>
  );
}