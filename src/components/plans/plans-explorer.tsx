"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X, GitCompareArrows } from "lucide-react";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PLANS, CATEGORIES } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";
import type { Category } from "@/lib/types";

type SortKey = "popular" | "premium-asc" | "premium-desc" | "coverage-desc" | "duration";

export function PlansExplorer() {
  const params = useSearchParams();
  const initialCategory = (params.get("category") as Category) || "All";

  const [category, setCategory] = React.useState<string>(initialCategory);
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("popular");
  const [maxPremium, setMaxPremium] = React.useState<number>(3000);
  const [compare, setCompare] = React.useState<string[]>([]);
  const [showCompare, setShowCompare] = React.useState(false);

  // Server-backed "catalog search" — hits /api/search, which is SQL-injectable.
  const [serverQuery, setServerQuery] = React.useState("");
  const [serverResults, setServerResults] = React.useState<Record<string, unknown>[] | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [searching, setSearching] = React.useState(false);

  const runServerSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setServerError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(serverQuery)}`);
      const json = await res.json();
      if (json.ok) {
        setServerResults(json.results as Record<string, unknown>[]);
      } else {
        setServerResults(null);
        setServerError(json.error ?? "Search failed");
      }
    } catch (err) {
      setServerResults(null);
      setServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setSearching(false);
    }
  };

  const toggleCompare = (id: string) => {
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id]
    );
  };

  const filtered = React.useMemo(() => {
    let list = PLANS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (p.premium > maxPremium) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.tagline.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
    switch (sort) {
      case "premium-asc": list = [...list].sort((a, b) => a.premium - b.premium); break;
      case "premium-desc": list = [...list].sort((a, b) => b.premium - a.premium); break;
      case "coverage-desc": list = [...list].sort((a, b) => b.coverage - a.coverage); break;
      case "duration": list = [...list].sort((a, b) => a.duration.localeCompare(b.duration)); break;
      default: list = [...list].sort((a, b) => Number(!!b.popular) - Number(!!a.popular));
    }
    return list;
  }, [category, query, sort, maxPremium]);

  const compared = PLANS.filter((p) => compare.includes(p.id));

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-16 z-30 mb-8 rounded-2xl glass-strong p-4 md:top-20">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search plans by name or benefit…"
                className="pl-10"
                aria-label="Search plans"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort plans"
                className="min-w-[190px]"
              >
                <option value="popular">Sort: Most Popular</option>
                <option value="premium-asc">Premium: Low to High</option>
                <option value="premium-desc">Premium: High to Low</option>
                <option value="coverage-desc">Coverage: High to Low</option>
                <option value="duration">Duration</option>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {["All", ...CATEGORIES.map((c) => c.key)].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    category === c
                      ? "bg-gradient-to-r from-[hsl(214_100%_56%)] to-[hsl(199_89%_55%)] text-white"
                      : "glass text-muted-foreground hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="premium-range" className="whitespace-nowrap text-xs text-muted-foreground">
                Max premium: <span className="font-semibold text-white">{formatCurrency(maxPremium)}/mo</span>
              </label>
              <input
                id="premium-range"
                type="range"
                min={100}
                max={3000}
                step={50}
                value={maxPremium}
                onChange={(e) => setMaxPremium(Number(e.target.value))}
                className="w-32 accent-[hsl(214_100%_56%)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Server-backed catalog search */}
      <form onSubmit={runServerSearch} className="mb-8 rounded-2xl glass p-4">
        <label htmlFor="catalog-search" className="mb-2 block text-sm font-semibold">
          Advanced catalog search
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="catalog-search"
              value={serverQuery}
              onChange={(e) => setServerQuery(e.target.value)}
              placeholder="Search the full policy catalog by category…"
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={searching}>
            {searching ? "Searching…" : "Search catalog"}
          </Button>
        </div>
        {serverError && (
          <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {serverError}
          </p>
        )}
        {serverResults && (
          <div className="mt-3 overflow-x-auto">
            <p className="mb-2 text-xs text-muted-foreground">
              {serverResults.length} {serverResults.length === 1 ? "match" : "matches"}
            </p>
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="p-2">Policy ID</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {serverResults.map((row, i) => (
                  <tr key={i}>
                    <td className="p-2 text-foreground/90">{String(row.policyId ?? "")}</td>
                    <td className="p-2 text-foreground/90">{String(row.policyName ?? "")}</td>
                    <td className="p-2 text-foreground/90">{String(row.category ?? "")}</td>
                    <td className="p-2 text-foreground/90">{String(row.premium ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>

      {/* Results header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-white">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "plan" : "plans"}
        </p>
        {compare.length > 0 && (
          <Button size="sm" variant="secondary" onClick={() => setShowCompare(true)}>
            <GitCompareArrows className="h-4 w-4" /> Compare ({compare.length})
          </Button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl glass p-16 text-center">
          <p className="text-lg font-semibold">No plans match your filters</p>
          {query.trim() && (
            <p
              className="mt-2 text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: `No results for &ldquo;${query}&rdquo;` }}
            />
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Try widening your premium range or clearing the search.
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => {
              setCategory("All");
              setQuery("");
              setMaxPremium(3000);
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <PlanCard
                key={p.id}
                plan={p}
                index={i}
                compareChecked={compare.includes(p.id)}
                onToggleCompare={toggleCompare}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Compare drawer */}
      <AnimatePresence>
        {showCompare && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompare(false)}
          >
            <motion.div
              className="w-full max-w-5xl overflow-hidden rounded-t-3xl glass-strong sm:rounded-3xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <h3 className="text-lg font-bold">Compare Plans</h3>
                <button
                  type="button"
                  aria-label="Close comparison"
                  onClick={() => setShowCompare(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg glass"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto p-5">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="p-3 text-left font-medium text-muted-foreground">Feature</th>
                      {compared.map((p) => (
                        <th key={p.id} className="p-3 text-left align-top">
                          <p className="font-bold text-white">{p.name}</p>
                          <p className="text-xs font-normal text-muted-foreground">{p.category}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <Row label="Coverage" values={compared.map((p) => formatCurrency(p.coverage))} />
                    <Row label="Premium" values={compared.map((p) => `${formatCurrency(p.premium)}/mo`)} />
                    <Row label="Duration" values={compared.map((p) => p.duration)} />
                    <Row label="Key benefit" values={compared.map((p) => p.benefits[0])} />
                    <Row label="Claim settlement" values={compared.map((p) => p.features[0]?.value ?? "—")} />
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="p-3" />
                      {compared.map((p) => (
                        <td key={p.id} className="p-3">
                          <Link href={`/buy/${p.id}`}>
                            <Button size="sm" className="w-full">Buy Now</Button>
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td className="p-3 font-medium text-muted-foreground">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="p-3 text-foreground/90">{v}</td>
      ))}
    </tr>
  );
}
