import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4">
      <Link href="/dashboard">
        <Button>Open Dashboard</Button>
      </Link>
    </div>
  );
}
