"use client"

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GithubIcon, GoogleIcon, MicrosoftIcon } from "@/components/icons";

export interface OAuthProvider {
  id: "github" | "google" | "microsoft";
  label: string;
}

const ICONS = {
  github: GithubIcon,
  google: GoogleIcon,
  microsoft: MicrosoftIcon,
};

export function OAuthButtons({ providers }: { providers: OAuthProvider[] }) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  if (!providers.length) return null;

  return (
    <div className="grid gap-2">
      {providers.map((provider) => {
        const Icon = ICONS[provider.id];
        return (
          <Button
            key={provider.id}
            variant="outline"
            className="w-full"
            disabled={loadingProvider !== null}
            onClick={async () => {
              setLoadingProvider(provider.id);
              await signIn(provider.id, { callbackUrl: "/dashboard" });
            }}
          >
            {loadingProvider === provider.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Icon className="size-4" />
            )}
            Continue with {provider.label}
          </Button>
        );
      })}
    </div>
  );
}
