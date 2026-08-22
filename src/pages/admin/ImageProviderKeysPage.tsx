import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const api = supabase as any;
type Provider = "d" | "r";
type KeyStatus = { id: string; provider: Provider; enabled: boolean; consecutive_failures: number; total_failures: number };

export default function ImageProviderKeysPage() {
  const [provider, setProvider] = useState<Provider>("d");
  const [secret, setSecret] = useState("");
  const [keys, setKeys] = useState<KeyStatus[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await api.rpc("list_image_provider_key_status");
    if (error) {
      setMessage("-");
      return;
    }
    setKeys((data || []) as KeyStatus[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const add = async () => {
    const value = secret.trim();
    if (!value) return;
    setBusy(true);
    setMessage("");
    const { error } = await api.rpc("add_image_provider_key", { p_provider: provider, p_secret: value });
    setBusy(false);
    if (error) {
      setMessage("-");
      return;
    }
    setSecret("");
    setMessage("+");
    await load();
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-8">
      <section className="mx-auto w-full max-w-xl">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex gap-2" role="tablist" aria-label="provider">
            {(["d", "r"] as Provider[]).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={provider === item}
                onClick={() => setProvider(item)}
                className={`h-9 min-w-9 rounded-lg border px-3 text-sm transition-colors ${provider === item ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); void add(); }} className="flex gap-2">
            <input
              type="password"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              autoComplete="new-password"
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
              aria-label={provider}
            />
            <button type="submit" disabled={busy || !secret.trim()} className="h-10 rounded-lg border border-border px-4 text-sm disabled:opacity-40">
              {busy ? "…" : "+"}
            </button>
          </form>

          {message ? <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">{message}</p> : null}

          <div className="mt-8 space-y-2">
            {keys.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm">
                <span>{item.provider}</span>
                <span className={item.enabled ? "text-muted-foreground" : "text-destructive"}>{item.enabled ? "on" : "off"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
