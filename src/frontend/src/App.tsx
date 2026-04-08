import { Toaster } from "@/components/ui/sonner";
import FlowDiagram from "./pages/FlowDiagram";

export default function App() {
  return (
    <div
      className="min-h-screen w-full overflow-hidden bg-background"
      data-ocid="app-root"
    >
      <FlowDiagram />
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
