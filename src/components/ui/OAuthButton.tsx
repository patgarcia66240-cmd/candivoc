import React from "react"
import {
  GlobeAltIcon,
  BriefcaseIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/solid"

type OAuthProvider = "google" | "linkedin" | "github"

interface OAuthButtonProps {
  provider: OAuthProvider
  label?: string
}

const providerConfig: Record<
  OAuthProvider,
  { name: string; color: string; icon: React.ReactNode; path: string }
> = {
  google: {
    name: "Google",
    color: "bg-red-600 hover:bg-red-700",
    icon: <GlobeAltIcon className="w-5 h-5 text-white" />,
    path: "/auth/google",
  },
  linkedin: {
    name: "LinkedIn",
    color: "bg-blue-700 hover:bg-blue-800",
    icon: <BriefcaseIcon className="w-5 h-5 text-white" />,
    path: "/auth/linkedin",
  },
  github: {
    name: "GitHub",
    color: "bg-gray-800 hover:bg-gray-900",
    icon: <CodeBracketIcon className="w-5 h-5 text-white" />,
    path: "/auth/github",
  },
}

export default function OAuthButton({ provider, label }: OAuthButtonProps) {
  // ⬇️ Lecture des variables d’environnement définies dans .env
  const API_URL = import.meta.env.VITE_API_URL
  const REDIRECT_URL = import.meta.env.VITE_REDIRECT_URL

  const config = providerConfig[provider]

  const handleLogin = () => {
    const redirectParam = REDIRECT_URL
      ? `?redirect_to=${encodeURIComponent(REDIRECT_URL)}`
      : ""
    const fullUrl = `${API_URL}${config.path}${redirectParam}`

    console.log("➡️ Redirection vers :", fullUrl)
    window.location.href = fullUrl
  }

  return (
    <button
      onClick={handleLogin}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition ${config.color}`}
    >
      {config.icon}
      <span>{label || config.name}</span>
    </button>
  )
}
