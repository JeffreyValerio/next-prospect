import { Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export const Logo = () => {
    return (
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Users className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <TrendingUp className="h-2 w-2 text-white" />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    NextProspect
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                    Sistema de gestión
                </span>
            </div>
        </Link>
    )
}
