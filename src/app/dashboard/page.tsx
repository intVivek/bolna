import { StoreProvider } from "@/store";
import FlowChart from "@/components/FlowChart";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  return (
    <StoreProvider>
      <div className="fixed inset-0 flex flex-col w-screen h-screen">
        <Header />
        <div className="w-full relative flex flex-1 min-h-0">
          <Sidebar />
          <FlowChart />
        </div>
      </div>
    </StoreProvider>
  );
}
