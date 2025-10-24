export const dynamic = 'force-dynamic'
export const revalidate = 0

import { auth, currentUser } from "@clerk/nextjs/server";
import { getProspect } from "@/actions/prospects/get-prospect";
import { 
  CallAndSales, 
  Objective, 
  ProspectsByUser, 
  Sales, 
  UsersReport,
  DashboardStats,
  PerformanceMetrics,
  RecentActivity,
  GoalsAndTargets,
  DashboardWithFilters
} from "@/components";
import { DashboardWithContext } from "@/components/dashboard/DashboardWithContext";

export default async function DashboardPage() {

  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const user = await currentUser()
  const role = user?.publicMetadata?.role ?? ""

  const isAdmin = role === "admin";

  const allProspects = await getProspect();
  let prospects = allProspects;

  if (!isAdmin && user?.firstName) {
    const userName = `${user?.firstName} ${user?.lastName}`;
    prospects = allProspects.filter((p: { assignedTo: string; }) => p.assignedTo?.trim() === userName);
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header de bienvenida */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          👋🏻 ¡Hola, <span className="text-blue-600 dark:text-blue-400">{user?.firstName} {user?.lastName}</span>!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido a tu panel de control. Aquí tienes un resumen completo de tu rendimiento y actividades.
        </p>
      </div>

      {/* Dashboard con filtros globales */}
      <DashboardWithContext prospects={prospects} isAdmin={isAdmin}>
        <DashboardWithFilters prospects={prospects} isAdmin={isAdmin}>
          <div className="space-y-8">
            {/* Estadísticas generales */}
            <DashboardStats isAdmin={isAdmin} />

            {/* Métricas de rendimiento */}
            <PerformanceMetrics isAdmin={isAdmin} />

            {/* Objetivos y metas */}
            <GoalsAndTargets isAdmin={isAdmin} />

            {/* Reportes principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <UsersReport isAdmin={isAdmin} />
              <Sales isAdmin={isAdmin} />
              <Objective isAdmin={isAdmin} />
            </div>

            {/* Reportes adicionales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="lg:col-span-2 h-full">
                <CallAndSales isAdmin={isAdmin} />
              </div>
              <div className="lg:col-span-1 h-full">
                <RecentActivity />
              </div>
            </div>

            {/* Reporte de administrador */}
            {isAdmin && (
              <ProspectsByUser />
            )}
          </div>
        </DashboardWithFilters>
      </DashboardWithContext>
    </div>
  );
}