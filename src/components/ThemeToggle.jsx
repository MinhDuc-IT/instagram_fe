"use client"
import { Moon, Sun } from "lucide-react"
import { useApp } from "../context/AppContext"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    </button>
  )
}
