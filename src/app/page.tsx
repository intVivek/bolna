import FlowChart from "@/components/FlowChart";

import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="fixed inset-0 flex w-screen h-screen">
      <Sidebar />
      <FlowChart />
    </div>
  );
}
