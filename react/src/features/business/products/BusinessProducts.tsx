import { useContext, useState } from "react";
import { Filter, Plus, Search, ShoppingBag } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import BusinessDeleteDialog from "../components/BusinessDeleteDialog";
import BusinessHeaderPortal from "../components/BusinessHeaderPortal";
import BusinessHeaderButton from "../components/BusinessHeaderButton";
import { BusinessTabButton, BusinessTabNav } from "../components/BusinessTabs";
import { BusinessHeaderContext } from "../components/businessHeaderContext";
import { useActiveBusinessContext } from "../directory/activeContext";
import { readBusinesses } from "../directory/businesses";
import { ProductDialog, SimpleDialog, StockDialog, type StockLine } from "./ProductDialogs";
import { applyStockChange, money, type Product, type ProductCategory, type ProductData, type Supplier, type TechCard, type Warehouse } from "./products";
import { useProducts } from "./useProducts";
import { card, ProductList, RowActions } from "./ProductList";
import ProductSections, { type Editing, type Deleting } from "./ProductSections";
import ProductFilterDialog from "./ProductFilterDialog";
import TechCardDialog from "./TechCardDialog";
import { readServiceData } from "../services/services";

type Tab = "balances" | "warehouses" | "catalog" | "techcards" | "operations" | "inventory" | "suppliers";
const tabs: { id: Tab; label: string }[] = [
  { id: "balances", label: "Qalıqlar" }, { id: "warehouses", label: "Anbarlar" }, { id: "catalog", label: "Bütün məhsullar" },
  { id: "techcards", label: "Texnoloji kartlar" }, { id: "operations", label: "Anbar əməliyyatları" },
  { id: "inventory", label: "İnventarizasiya" }, { id: "suppliers", label: "Təchizatçılar" },
];
export default function BusinessProducts({ session }: { session: BusinessSession }) {
  const { data, update } = useProducts(session);
  const { openPos } = useContext(BusinessHeaderContext);
  const activeContext = useActiveBusinessContext(session);
  const [tab, setTab] = useState<Tab>("balances");
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("auto");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [stockMode, setStockMode] = useState<"receipt" | "writeoff" | "inventory" | null>(null);
  const [deleting, setDeleting] = useState<Deleting | null>(null);
  const [error, setError] = useState("");
  const services = readServiceData(session).services;
  const branches = readBusinesses(session).flatMap((business) => business.branches);
  const selectedWarehouse = warehouse === "auto" ? data.warehouses.find((item) => item.branchId === activeContext?.branchId)?.id ?? "all" : warehouse;
  const scopeProducts = data.products.filter((item) => selectedWarehouse === "all" || item.warehouseId === selectedWarehouse);
  const filtered = scopeProducts.filter((item) => (category === "all" || item.categoryId === category) && (stockFilter === "all" || (stockFilter === "low" && item.quantity <= item.minimum) || (stockFilter === "available" && item.quantity > item.minimum)) && `${item.name} ${item.sku}`.toLocaleLowerCase("az-AZ").includes(search.toLocaleLowerCase("az-AZ")));
  const critical = scopeProducts.filter((item) => item.quantity <= item.minimum).length;
  const inStock = scopeProducts.filter((item) => item.quantity > item.minimum).length;
  const value = scopeProducts.reduce((sum, item) => sum + item.quantity * item.cost, 0);
  const button = (label: string, onClick: () => void, primary = false) => <button type="button" onClick={onClick} className={`flex min-h-11 cursor-pointer items-center justify-center gap-1 rounded-xl px-4 text-sm font-bold ${primary ? "bg-yellow-primary hover:bg-yellow-300" : "bg-white shadow-sm hover:bg-slate-50"}`}><Plus size={16} />{label}</button>;
  function saveProduct(item: Product) { if (item.sku && data.products.some((other) => other.sku.toLocaleLowerCase("az-AZ") === item.sku.toLocaleLowerCase("az-AZ") && other.id !== item.id)) { setError("Bu SKU artıq mövcuddur."); return; } update({ ...data, products: data.products.some((old) => old.id === item.id) ? data.products.map((old) => old.id === item.id ? item : old) : [...data.products, item] }); setError(""); setEditingProduct(undefined); }
  function saveSimple(item: ProductCategory | Warehouse | Supplier | TechCard) {
    if (!editing) return;
    const key = ({ category: "categories", warehouse: "warehouses", supplier: "suppliers", techcard: "techCards" } as const)[editing.kind];
    const list = data[key] as (typeof item)[];
    update({ ...data, [key]: list.some((old) => old.id === item.id) ? list.map((old) => old.id === item.id ? item : old) : [...list, item] }); setEditing(null);
  }
  function remove() {
    if (!deleting) return;
    const { kind, id } = deleting;
    if (kind === "product") update({ ...data, products: data.products.filter((item) => item.id !== id), techCards: data.techCards.map((item) => ({ ...item, items: (item.items ?? [{ productId: item.productId, quantity: item.quantity }]).filter((ingredient) => ingredient.productId !== id) })).filter((item) => item.items?.length) });
    if (kind === "category") update({ ...data, categories: data.categories.filter((item) => item.id !== id), products: data.products.map((item) => item.categoryId === id ? { ...item, categoryId: "" } : item) });
    if (kind === "warehouse") update({ ...data, warehouses: data.warehouses.filter((item) => item.id !== id), products: data.products.map((item) => item.warehouseId === id ? { ...item, warehouseId: "" } : item) });
    if (kind === "supplier") update({ ...data, suppliers: data.suppliers.filter((item) => item.id !== id) });
    if (kind === "techcard") update({ ...data, techCards: data.techCards.filter((item) => item.id !== id) });
    setDeleting(null);
  }
  function saveStock(lines: StockLine[], note: string) {
    if (!stockMode || !lines.length || lines.some((line) => !line.productId || !Number.isInteger(line.amount) || line.amount < (stockMode === "inventory" ? 0 : 1)) || new Set(lines.map((line) => line.productId)).size !== lines.length) { setError("Məhsulları və miqdarları yoxlayın."); return; }
    let next = data;
    const inventoryEntries: ProductData["inventories"] = [];
    for (const line of lines) {
      const product = next.products.find((item) => item.id === line.productId);
      if (!product) { setError("Məhsul tapılmadı."); return; }
      const difference = stockMode === "receipt" ? line.amount : stockMode === "writeoff" ? -line.amount : line.amount - product.quantity;
      if (stockMode === "inventory" && difference === 0) continue;
      const changed = applyStockChange(next, line.productId, difference, stockMode === "inventory" ? "adjustment" : stockMode, note);
      if (!changed) { setError(`${product.name}: miqdar düzgün deyil və ya qalıq kifayət etmir.`); return; }
      next = changed;
      if (stockMode === "inventory") inventoryEntries.push({ id: crypto.randomUUID(), productName: product.name, expected: product.quantity, actual: line.amount, date: new Date().toISOString() });
    }
    if (!inventoryEntries.length && stockMode === "inventory") { setError("Faktiki qalıq dəyişməyib."); return; }
    update(stockMode === "inventory" ? { ...next, inventories: [...inventoryEntries, ...next.inventories] } : next);
    setError(""); setStockMode(null);
  }
  const openDelete = (kind: Deleting["kind"], item: { id: string; name: string }) => setDeleting({ kind, id: item.id, name: item.name });
  const productList = <ProductList products={filtered} data={data} onEdit={setEditingProduct} onDelete={(item) => openDelete("product", item)} />;
  return <div className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-7 sm:py-7">
    <BusinessHeaderPortal slot="title">{tabs.find((item) => item.id === tab)?.label}</BusinessHeaderPortal>
    <BusinessHeaderPortal slot="subtitle">{tab === "balances" ? "Stok və anbar qalıqları" : "Məhsul, qalıq və anbar hərəkətləri"}</BusinessHeaderPortal>
    <BusinessHeaderPortal slot="actions">{tab === "balances" ? <BusinessHeaderButton onClick={openPos}><ShoppingBag />Kassa satışı (POS)</BusinessHeaderButton> : <BusinessHeaderButton onClick={() => setEditingProduct(null)}><Plus />Yeni məhsul</BusinessHeaderButton>}</BusinessHeaderPortal>
    <BusinessTabNav label="Məhsullar bölmələri">{tabs.map((item) => <BusinessTabButton key={item.id} active={tab === item.id} onClick={() => { setTab(item.id); setError(""); }}>{item.label}</BusinessTabButton>)}</BusinessTabNav>
    {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
    {tab === "balances" && <><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ label: "Məhsullar", value: scopeProducts.length }, { label: "Qalıqda", value: inStock }, { label: "Kritik qalıq", value: critical }, { label: "Maya dəyəri", value: money(value) }].map((item) => <div key={item.label} className={card}><p className="text-xs text-slate-500">{item.label}</p><strong className="mt-2 block text-xl sm:text-2xl">{item.value}</strong></div>)}</div></>}
    {(tab === "balances" || tab === "catalog") && <><div className="flex gap-2"><label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search size={17} className="shrink-0 text-slate-400" /><input aria-label="Məhsul axtar" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Məhsul adı və ya SKU" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><button type="button" onClick={() => setFilterOpen(true)} aria-label="Filtrlər" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"><Filter size={17} /><span className="hidden sm:inline">Filtrlər</span></button></div>{tab === "catalog" && <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">{button("Kateqoriya əlavə et", () => setEditing({ kind: "category" }))}</div>}{productList}{tab === "catalog" && <section className={card}><h3 className="font-bold">Kateqoriyalar</h3><div className="mt-3 space-y-2">{data.categories.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-2"><span className="min-w-0 break-words text-sm">{item.name}</span><RowActions edit={() => setEditing({ kind: "category", initial: item })} remove={() => openDelete("category", item)} /></div>)}</div></section>}</>}
    <ProductSections tab={tab} data={data} branches={branches} services={services} button={button} setEditing={setEditing} setStockMode={setStockMode} openDelete={openDelete} />
    {filterOpen && <ProductFilterDialog data={data} warehouse={warehouse} category={category} stockFilter={stockFilter} setWarehouse={setWarehouse} setCategory={setCategory} setStockFilter={setStockFilter} onClose={() => setFilterOpen(false)} />}
    {editingProduct !== undefined && <ProductDialog key={editingProduct?.id ?? "new"} initial={editingProduct ?? undefined} data={data} error={error} onClose={() => { setEditingProduct(undefined); setError(""); }} onSave={saveProduct} />}
    {editing?.kind === "techcard" && <TechCardDialog key={editing.initial?.id ?? "new"} initial={editing.initial as TechCard | undefined} products={data.products} services={services.filter((item) => !item.businessId || item.businessId === activeContext?.businessId)} onClose={() => setEditing(null)} onSave={saveSimple} />}
    {editing && editing.kind !== "techcard" && <SimpleDialog key={editing.initial?.id ?? editing.kind} kind={editing.kind} initial={editing.initial} branches={branches} onClose={() => setEditing(null)} onSave={saveSimple} />}
    {stockMode && <StockDialog key={stockMode} data={data} mode={stockMode} error={error} onClose={() => { setStockMode(null); setError(""); }} onSave={saveStock} />}
    {deleting && <BusinessDeleteDialog name={deleting.name} detail={deleting.kind === "category" ? "Bağlı məhsullar kateqoriyasız qalacaq." : deleting.kind === "warehouse" ? "Bağlı məhsullar anbarsız qalacaq." : undefined} onClose={() => setDeleting(null)} onDelete={remove} />}
  </div>;
}
