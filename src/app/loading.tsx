import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="rounded flex items-center bg-gray-100/90 px-4 py-2 shadow-lg">
        <Loader className="mr-2 animate-spin" size={20} />
        <p className="text-gray-700">Cargando...</p>
      </div>
    </div>
  );
}
  