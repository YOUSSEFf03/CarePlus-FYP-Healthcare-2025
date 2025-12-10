import React, { useMemo, useState, useEffect } from "react";
import "../../styles/pharmacyInventory.css";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import { ReactComponent as PlusIcon } from "../../assets/svgs/Plus.svg";
import { ReactComponent as ExportIcon } from "../../assets/svgs/Export.svg";
import { ReactComponent as UploadIcon } from "../../assets/svgs/UploadSimple.svg";
import pharmacyApiService, { PharmacyBranchStock, Category } from "../../services/pharmacyApiService";

type InventoryItem = {
    id: string;
    name: string;
    sku: string;
    strength?: string;
    form?: string;
    price: number;           // unit price
    stock: number;           // current on-hand qty
    reorderPoint: number;    // alert threshold
    category: string;
    updated: string;         // human friendly time e.g., '2h ago'
    status?: "Active" | "Hidden" | "Discontinued";
    item_id?: number;
    stock_id?: number;
};

export default function PharmacyInventory() {
    const [q, setQ] = useState("");
    const [category, setCategory] = useState<"" | InventoryItem["category"]>("");
    const [lowOnly, setLowOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pageSize = 6;

    // Load inventory data
    useEffect(() => {
        const loadInventory = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Load categories first
                const categoriesData = await pharmacyApiService.getCategories();
                setCategories(categoriesData);
                
                // Load stock data
                const stockData = await pharmacyApiService.getStock(1, 100);
                
                // Transform stock data to inventory items
                const inventoryItems: InventoryItem[] = stockData.data.map(stock => ({
                    id: stock.item?.item_id?.toString() || stock.pharmacy_branch_stock_id.toString(),
                    name: stock.item?.name || 'Unknown Item',
                    sku: `SKU-${stock.item?.item_id || stock.pharmacy_branch_stock_id}`,
                    strength: stock.item?.medicines?.[0]?.dosage || undefined,
                    form: stock.item?.medicines?.[0]?.type || undefined,
                    price: stock.sold_price,
                    stock: stock.quantity,
                    reorderPoint: 10, // Default reorder point
                    category: stock.item?.category?.category_name || 'Unknown',
                    updated: new Date(stock.last_updated).toLocaleDateString(),
                    status: stock.quantity > 0 ? "Active" : "Hidden",
                    item_id: stock.item?.item_id,
                    stock_id: stock.pharmacy_branch_stock_id,
                }));
                
                setInventory(inventoryItems);
            } catch (err) {
                console.error('Error loading inventory:', err);
                setError(err instanceof Error ? err.message : 'Failed to load inventory');
            } finally {
                setLoading(false);
            }
        };

        loadInventory();
    }, []);

    const filtered = useMemo(() => {
        return inventory.filter(item => {
            const matchesQuery =
                `${item.name} ${item.sku} ${item.form ?? ""} ${item.strength ?? ""}`
                    .toLowerCase()
                    .includes(q.trim().toLowerCase());

            const matchesCat = category ? item.category === category : true;
            const low = item.stock <= item.reorderPoint;
            const matchesLow = lowOnly ? low : true;

            return matchesQuery && matchesCat && matchesLow;
        });
    }, [inventory, q, category, lowOnly]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    const resetPage = () => setPage(1);

    // Handle stock adjustment
    const handleStockAdjustment = async (stockId: number, newQuantity: number) => {
        try {
            await pharmacyApiService.updateStock(stockId, { quantity: newQuantity });
            // Reload inventory
            const stockData = await pharmacyApiService.getStock(1, 100);
            const inventoryItems: InventoryItem[] = stockData.data.map(stock => ({
                id: stock.item?.item_id?.toString() || stock.pharmacy_branch_stock_id.toString(),
                name: stock.item?.name || 'Unknown Item',
                sku: `SKU-${stock.item?.item_id || stock.pharmacy_branch_stock_id}`,
                strength: stock.item?.medicines?.[0]?.dosage || undefined,
                form: stock.item?.medicines?.[0]?.type || undefined,
                price: stock.sold_price,
                stock: stock.quantity,
                reorderPoint: 10,
                category: stock.item?.category?.category_name || 'Unknown',
                updated: new Date(stock.last_updated).toLocaleDateString(),
                status: stock.quantity > 0 ? "Active" : "Hidden",
                item_id: stock.item?.item_id,
                stock_id: stock.pharmacy_branch_stock_id,
            }));
            setInventory(inventoryItems);
        } catch (err) {
            console.error('Error adjusting stock:', err);
            alert('Failed to adjust stock');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="inventory">
                <div className="inventory__header">
                    <CustomText variant="text-heading-H2">Inventory</CustomText>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CustomText variant="text-body-lg-r">Loading inventory...</CustomText>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="inventory">
                <div className="inventory__header">
                    <CustomText variant="text-heading-H2">Inventory</CustomText>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column' }}>
                    <div style={{ color: '#ef4444', marginBottom: '16px' }}>
                        <CustomText variant="text-body-lg-r">
                            Error: {error}
                        </CustomText>
                    </div>
                    <Button 
                        text="Retry" 
                        onClick={() => window.location.reload()} 
                        variant="primary"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="inventory">
            {/* Header */}
            <div className="inventory__header">
                <CustomText variant="text-heading-H2">Inventory</CustomText>
                <div className="inventory__actions">
                    <Button
                        text="Add Product"
                        iconLeft={<PlusIcon width={24} />}
                        className="btn-compact"
                    />
                    <Button
                        text="Import CSV"
                        variant="secondary"
                        iconLeft={<UploadIcon width={24} />}
                        className="btn-compact"
                    />
                    <Button
                        text="Export CSV"
                        variant="tertiary"
                        iconLeft={<ExportIcon width={24} />}
                        className="btn-compact"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="inventory__filters">
                <div className="input-with-icon">
                    <span className="search__icon">
                        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M28.7078 27.293L22.449 21.0355C24.2631 18.8577 25.1676 16.0643 24.9746 13.2364C24.7815 10.4086 23.5057 7.7641 21.4125 5.85299C19.3193 3.94189 16.5698 2.91135 13.7362 2.97575C10.9025 3.04015 8.20274 4.19453 6.19851 6.19876C4.19429 8.20298 3.0399 10.9027 2.9755 13.7364C2.9111 16.5701 3.94164 19.3195 5.85275 21.4127C7.76385 23.5059 10.4084 24.7818 13.2362 24.9748C16.064 25.1679 18.8574 24.2633 21.0353 22.4493L27.2928 28.708C27.3857 28.8009 27.496 28.8746 27.6174 28.9249C27.7388 28.9752 27.8689 29.0011 28.0003 29.0011C28.1317 29.0011 28.2618 28.9752 28.3832 28.9249C28.5046 28.8746 28.6149 28.8009 28.7078 28.708C28.8007 28.6151 28.8744 28.5048 28.9247 28.3834C28.975 28.262 29.0008 28.1319 29.0008 28.0005C29.0008 27.8691 28.975 27.739 28.9247 27.6176C28.8744 27.4962 28.8007 27.3859 28.7078 27.293ZM5.00029 14.0005C5.00029 12.2205 5.52813 10.4804 6.51706 9.0004C7.50599 7.52035 8.9116 6.3668 10.5561 5.68561C12.2007 5.00443 14.0103 4.8262 15.7561 5.17346C17.5019 5.52073 19.1056 6.3779 20.3642 7.63657C21.6229 8.89524 22.4801 10.4989 22.8274 12.2447C23.1746 13.9905 22.9964 15.8001 22.3152 17.4447C21.634 19.0892 20.4805 20.4948 19.0004 21.4838C17.5204 22.4727 15.7803 23.0005 14.0003 23.0005C11.6141 22.9979 9.3265 22.0488 7.63925 20.3616C5.95199 18.6743 5.00293 16.3867 5.00029 14.0005Z" fill="currentColor" />
                        </svg>
                    </span>
                    <input
                        className="ph-input"
                        type="text"
                        placeholder="Search by name or SKU"
                        value={q}
                        onChange={(e) => { setQ(e.target.value); resetPage(); }}
                    />
                </div>

                <div className="row-gap"></div>

                <div className="select-category-inventory">
                    <label>Category</label>
                    <select
                        value={category}
                        onChange={(e) => { setCategory(e.target.value as any); resetPage(); }}
                    >
                        <option value="">All</option>
                        {categories.map(cat => (
                            <option key={cat.category_id} value={cat.category_name}>
                                {cat.category_name}
                            </option>
                        ))}
                    </select>
                </div>

                <label className="checkbox">
                    <input
                        type="checkbox"
                        checked={lowOnly}
                        onChange={(e) => { setLowOnly(e.target.checked); resetPage(); }}
                    />
                    <span>Show low / out-of-stock only</span>
                </label>
            </div>

            {/* Table */}
            <div className="panel">
                <div className="table inventory-table">
                    <div className="table__head">
                        <span>Product</span>
                        <span>SKU</span>
                        <span>Stock</span>
                        <span>Reorder</span>
                        <span>Status</span>
                        <span>Price</span>
                        <span>Updated</span>
                        <span></span>
                    </div>

                    <div className="table__body">
                        {paged.map(item => {
                            const low = item.stock <= item.reorderPoint;
                            const out = item.stock === 0;
                            const status = item.status ?? "Active";
                            return (
                                <div className="table__row" key={item.id}>
                                    <div className="product-cell">
                                        <div className="prod-name">
                                            {item.name}{item.strength ? ` ${item.strength}` : ""}{item.form ? ` • ${item.form}` : ""}
                                        </div>
                                        <div className="prod-meta">{item.category}</div>
                                    </div>
                                    <span className="mono">{item.sku}</span>
                                    <span className={`qty ${out ? "qty--out" : low ? "qty--low" : ""}`}>{item.stock}</span>
                                    <span className="muted">{item.reorderPoint}</span>
                                    <span className={`status status--${status.toLowerCase()}`}>{status}</span>
                                    <span>${item.price.toFixed(2)}</span>
                                    <span className="muted">{item.updated}</span>
                                    <div className="row-actions">
                                        <Button 
                                            variant="ghost" 
                                            className="btn-xs" 
                                            text="Adjust" 
                                            onClick={() => {
                                                const newQty = prompt(`Adjust stock for ${item.name}:`, item.stock.toString());
                                                if (newQty && !isNaN(Number(newQty)) && item.stock_id) {
                                                    handleStockAdjustment(item.stock_id, Number(newQty));
                                                }
                                            }}
                                        />
                                        <Button variant="secondary" className="btn-xs" text="Edit" />
                                    </div>
                                </div>
                            );
                        })}
                        {paged.length === 0 && (
                            <div className="table__empty">
                                <CustomText variant="text-body-md-r">No items found.</CustomText>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer: pagination */}
                <div className="table__footer">
                    <div className="hint">
                        Showing {(page - 1) * pageSize + 1}–
                        {Math.min(page * pageSize, filtered.length)} of {filtered.length}
                    </div>
                    <div className="pagination">
                        <Button
                            variant="ghost"
                            className="btn-xs"
                            text="Prev"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        />
                        <span className="page-indicator">{page} / {totalPages}</span>
                        <Button
                            variant="ghost"
                            className="btn-xs"
                            text="Next"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}