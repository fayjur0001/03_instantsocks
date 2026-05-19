"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import ProxySidebar from "@/components/admin/pages/socks5-proxy-ips/ProxySidebar";
import CartModal from "@/components/modals/CartModal";
import { COUNTRIES, MOCK_PROXIES } from "@/components/admin/pages/socks5-proxy-ips/Data";
import { FilterState, ProxyItem, ProxyTypeTab } from "@/types/admin/socks5-proxy-ips";
import ProxyTable from "@/components/admin/pages/socks5-proxy-ips/ProxyTable";
import RegionSelector from "@/components/admin/pages/socks5-proxy-ips/RegionSelector";
import CountrySelector from "@/components/admin/pages/socks5-proxy-ips/CountrySelector";
import TypeFilter from "@/components/admin/pages/socks5-proxy-ips/TypeFilter";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const EMPTY_FILTERS: FilterState = {
  ip: "", domain: "", state: "", city: "", isp: "", zip: "", type: "",
};

export default function ProxyBrowser() {
  const [activeRegion, setActiveRegion] = useState<string>("america");
  const [activeCountry, setActiveCountry] = useState<string>("AG");
  const [typeTab, setTypeTab] = useState<ProxyTypeTab>("all");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS); // Changed from any
  const [page, setPage] = useState(1);
  const [selectedProxy, setSelectedProxy] = useState<ProxyItem | null>(null);
  const [cart, setCart] = useState<ProxyItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // ── Stable filter setter ─────────────────────────────────────────────────
  const setFilter = useCallback((key: keyof FilterState, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  // ── Cart helpers ─────────────────────────────────────────────────────────
  const addToCart = useCallback((proxy: ProxyItem) => {
    setCart((prev) =>
      prev.some((p) => p.id === proxy.id) ? prev : [...prev, proxy]
    );
  }, []);

  const removeFromCart = useCallback(
    (id: string) => setCart((prev) => prev.filter((p) => p.id !== id)),
    []
  );

  const buyOne = useCallback(
    (proxy: ProxyItem) => {
      console.log("Purchasing proxy:", proxy);
      removeFromCart(proxy.id);
    },
    [removeFromCart]
  );

  const buyAll = useCallback(() => {
    console.log("Purchasing all:", cart);
    setCart([]);
    setShowCart(false);
  }, [cart]);

  const emptyCart = useCallback(() => setCart([]), []);

  // ── Countries for active region ──────────────────────────────────────────
  const regionCountries = useMemo(
    () => COUNTRIES.filter((c) => c.regionId === activeRegion),
    [activeRegion]
  );


  
  // Default to first country when region changes
  useEffect(() => {
    const first = regionCountries[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (first) setActiveCountry(first.code);
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, [activeRegion, regionCountries]);

  // ── Filtered proxy list ──────────────────────────────────────────────────
  const filteredProxies = useMemo(() => {
    const match = (val: string, f: string) =>
      !f || val.toLowerCase().includes(f.toLowerCase());

    return MOCK_PROXIES.filter((p) => {
      // Region filter
      if (activeRegion === "usa" && p.countryCode !== "US") return false;
      if (activeRegion !== "usa" && p.countryCode !== activeCountry) return false;
      // Type tab filter
      if (typeTab === "hosting" && p.type !== "DCH") return false;
      if (typeTab === "non-backlisted" && p.blacklisted) return false;
      // Column filters
      return (
        match(p.ip, filters.ip) &&
        match(p.domain, filters.domain) &&
        match(p.state, filters.state) &&
        match(p.city, filters.city) &&
        match(p.isp, filters.isp) &&
        match(p.zip, filters.zip) &&
        (!filters.type || p.type === filters.type)
      );
    });
  }, [activeRegion, activeCountry, typeTab, filters]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-c-bg-900 text-c-slate-300">

      {/* ── TOP: Navigation Header (Regions & Countries) ─────────────────── */}
      <div className="bg-c-bg-900 border-b border-c-slate-800/60 p-4 space-y-4">
        {/* Region selection bar */}
        <RegionSelector
          activeRegion={activeRegion}
          setActiveRegion={setActiveRegion}
        />

        {/* Country grid - visible based on region */}
        <CountrySelector
          regionCountries={regionCountries}
          setActiveCountry={setActiveCountry}
          setFilters={setFilters} setPage={setPage}
          activeCountry={activeCountry}
          EMPTY_FILTERS={EMPTY_FILTERS}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">

        {/* Type filter bar */}
        <TypeFilter
          setTypeTab={setTypeTab}
          typeTab={typeTab}
          setFilters={setFilters}
          setPage={setPage}
          EMPTY_FILTERS={EMPTY_FILTERS}
        />

        {/* Table + sidebar row */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">

          {/* Table */}
          <ProxyTable
            filters={filters}
            setFilters={setFilters}
            setFilter={setFilter}
            filteredProxies={filteredProxies}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
            cart={cart}
            addToCart={addToCart}
          />

          {/* Right info sidebar */}
          <div className="w-full lg:w-[280px] shrink-0 sticky top-20 self-start h-auto">
            <ProxySidebar
              proxy={selectedProxy}
              cartCount={cart.length}
              onShowCart={() => setShowCart(true)}
            />
          </div>
        </div>
      </div>

      {/* Cart modal */}
      {showCart && (
        <CartModal
          items={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onBuyOne={buyOne}
          onBuyAll={buyAll}
          onEmpty={emptyCart}
        />
      )}
    </div>
  );
}