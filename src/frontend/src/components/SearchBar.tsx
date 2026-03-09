import { Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { MapRef } from "../App";

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type Props = {
  mapRef: React.RefObject<MapRef | null>;
};

export default function SearchBar({ mapRef }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const listId = useId();

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        signal: abortRef.current.signal,
        headers: { "Accept-Language": "en" },
      });
      if (!res.ok) throw new Error("Nominatim request failed");
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setIsOpen(data.length > 0);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setResults([]);
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(val);
    }, 400);
  };

  const handleSelect = (result: NominatimResult) => {
    mapRef.current?.flyTo(
      Number.parseFloat(result.lat),
      Number.parseFloat(result.lon),
    );
    setQuery(result.display_name.split(",")[0]);
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    abortRef.current?.abort();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Search input container */}
      <div
        className={`
          flex items-center gap-1.5 h-7 rounded-sm border transition-all duration-200
          bg-background/80 backdrop-blur-sm
          ${
            isFocused
              ? "border-primary/60 w-[200px] sm:w-[260px]"
              : "border-border/60 w-[130px] sm:w-[180px]"
          }
        `}
      >
        <span className="pl-2 flex-shrink-0">
          {isLoading ? (
            <span className="inline-block h-3 w-3 rounded-full border border-primary border-t-transparent animate-spin" />
          ) : (
            <Search className="h-3 w-3 text-muted-foreground" />
          )}
        </span>

        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            if (results.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="SEARCH LOCATION"
          className="
            flex-1 min-w-0 bg-transparent text-foreground
            font-mono text-[10px] tracking-wider uppercase
            placeholder:text-muted-foreground/50 placeholder:text-[9px]
            focus:outline-none border-none
            py-0 h-full
          "
          aria-label="Search location"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listId}
          data-ocid="search.search_input"
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-1.5 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div
          id={listId}
          className="
            absolute top-full left-0 mt-1 z-50
            w-[280px] sm:w-[340px]
            bg-card border border-border rounded-sm
            shadow-[0_8px_32px_oklch(0_0_0/70%)]
            overflow-hidden
          "
          aria-label="Search results"
        >
          {/* Tactical header */}
          <div className="px-2 py-1 border-b border-border/50 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary signal-pulse" />
            <span className="font-mono text-[9px] text-primary uppercase tracking-widest">
              RESULTS — {results.length} FOUND
            </span>
          </div>

          <ul>
            {results.map((result, idx) => {
              const ocidIndex = idx + 1;
              const parts = result.display_name.split(", ");
              const name = parts[0];
              const region = parts.slice(1, 3).join(", ");

              return (
                <li key={result.place_id}>
                  <button
                    type="button"
                    className="
                      w-full text-left px-3 py-2
                      hover:bg-secondary/80 focus:bg-secondary/80
                      focus-visible:outline-none transition-colors duration-100
                      border-b border-border/30 last:border-0
                      group
                    "
                    onClick={() => handleSelect(result)}
                    data-ocid={`search.item.${ocidIndex}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[9px] text-muted-foreground/50 pt-0.5 w-3 flex-shrink-0">
                        {String(ocidIndex).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] text-foreground truncate group-hover:text-primary transition-colors">
                          {name}
                        </div>
                        {region && (
                          <div className="font-mono text-[9px] text-muted-foreground truncate mt-0.5">
                            {region}
                          </div>
                        )}
                        <div className="font-mono text-[8px] text-muted-foreground/50 mt-0.5">
                          {Number.parseFloat(result.lat).toFixed(4)}°N&nbsp;
                          {Number.parseFloat(result.lon).toFixed(4)}°E
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {isOpen &&
        results.length === 0 &&
        !isLoading &&
        query.trim().length >= 2 && (
          <div
            className="
            absolute top-full left-0 mt-1 z-50
            w-[240px] bg-card border border-border rounded-sm
            shadow-[0_8px_32px_oklch(0_0_0/70%)]
            px-3 py-2
          "
            data-ocid="search.empty_state"
          >
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              — NO RESULTS FOUND —
            </span>
          </div>
        )}
    </div>
  );
}
