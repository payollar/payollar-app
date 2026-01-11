"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";

export default function HeaderAuthButtons() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  if (isPending) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (!session?.user) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.push("/sign-in")}
      >
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground hidden md:block">
        {session.user.name || session.user.email}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/profile")}
        className="hidden md:flex items-center gap-2"
      >
        <User className="h-4 w-4" />
        Profile
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline">Sign Out</span>
      </Button>
    </div>
  );
}
