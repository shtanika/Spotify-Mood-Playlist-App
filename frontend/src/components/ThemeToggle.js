"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { FaMoon, FaSun } from "react-icons/fa";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <FaSun className="absolute h-10 w-10 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <FaMoon className="absolute h-10 w-10 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    )

}
