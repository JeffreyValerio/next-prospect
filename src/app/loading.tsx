import { Loading } from "@/components/ui/loading";

export default function LoadingPage() {
  return (
    <Loading 
      variant="pulse"
      size="lg"
      text="Cargando aplicación..."
      fullScreen={true}
    />
  );
}
  