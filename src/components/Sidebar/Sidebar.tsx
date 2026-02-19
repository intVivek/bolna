import NodeEditor from "../NodeEditor";

export default function Sidebar() {
  return (
    <div className="h-full w-[320px] border-r px-4 py-6">
      <div className="text-lg font-bold">Flow Builder</div>
      <NodeEditor />
    </div>
  );
}
