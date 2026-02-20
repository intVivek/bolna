import FlowStartOptions from "@/components/FlowStartOptions";

export default function Home() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Flow Builder</h1>
        <p className="text-sm text-muted-foreground">
          Build and visualize flow graphs
        </p>
      </div>
      <FlowStartOptions />
    </div>
  );
}
