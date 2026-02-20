import EdgeEditor from "../EdgeEditor/EdgeEditor";
import NodeEditor from "../NodeEditor";
import CodePreview from "../CodePreview";

export default function Sidebar() {
  return (
    <div className="h-full w-[320px] flex flex-col border-r">
      <div className="flex gap-4 flex-col flex-1 overflow-auto px-4 py-4">
        <NodeEditor />
        <EdgeEditor />
        <CodePreview />
      </div>
    </div>
  );
}
