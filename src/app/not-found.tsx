import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-1440 flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 ring-1 ring-white/10">
        <Compass className="h-8 w-8 text-primary" />
      </span>
      <h1 className="mt-6 text-5xl font-extrabold text-gradient">404</h1>
      <p className="mt-3 text-lg font-semibold">This page took an unexpected detour</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/"><Button>Back to Home</Button></Link>
        <Link href="/plans"><Button variant="outline">Explore Plans</Button></Link>
      </div>
    </div>
  );
}
