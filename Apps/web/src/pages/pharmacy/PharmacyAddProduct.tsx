import React, { useMemo, useRef, useState } from "react";
import "../../styles/doctorAppointments.css"; // keeps the panel + controls visual language
import "../../styles/addProduct.css";
import CustomText from "../../components/Text/CustomText";
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router-dom";

type ImageFile = { file: File; url: string };

type ProductDraft = {
    name: string;
    brand: string;
    sku: string;
    barcode: string;
    category: string;
    description: string;
    prescriptionRequired: boolean;
    price: number | "";
    cost: number | "";
    taxRate: number | "";
    stock: number | "";
    reorderPoint: number | "";
    unit: "unit" | "box" | "bottle" | "strip" | "pack";
    expirationDate?: string;
    supplier?: string;
    notes?: string;
    attributes: Array<{ key: string; value: string }>;
    variants: Array<{ name: string; sku: string }>;
};

const EMPTY: ProductDraft = {
    name: "",
    brand: "",
    sku: "",
    barcode: "",
    category: "",
    description: "",
    prescriptionRequired: false,
    price: "",
    cost: "",
    taxRate: 0,
    stock: "",
    reorderPoint: 10,
    unit: "unit",
    expirationDate: "",
    supplier: "",
    notes: "",
    attributes: [{ key: "", value: "" }],
    variants: [],
};

const units = ["unit", "box", "bottle", "strip", "pack"] as const;

export default function PharmacyAddProduct() {
    const navigate = useNavigate();
    const [form, setForm] = useState<ProductDraft>(EMPTY);
    const [images, setImages] = useState<ImageFile[]>([]);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const margin = useMemo(() => {
        const price = Number(form.price || 0);
        const cost = Number(form.cost || 0);
        if (!price) return 0;
        return Math.max(0, Number(((price - cost) / price) * 100));
    }, [form.price, form.cost]);

    const priceWithTax = useMemo(() => {
        const price = Number(form.price || 0);
        const tax = Number(form.taxRate || 0);
        return +(price * (1 + tax / 100)).toFixed(2);
    }, [form.price, form.taxRate]);

    const update = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const addImages = (files: FileList | null) => {
        if (!files) return;
        const next = Array.from(files).slice(0, 6 - images.length).map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setImages((imgs) => [...imgs, ...next]);
    };

    const removeImage = (idx: number) =>
        setImages((imgs) => imgs.filter((_, i) => i !== idx));

    const addAttributeRow = () =>
        setForm((f) => ({ ...f, attributes: [...f.attributes, { key: "", value: "" }] }));

    const removeAttributeRow = (idx: number) =>
        setForm((f) => ({
            ...f,
            attributes: f.attributes.filter((_, i) => i !== idx),
        }));

    const onSave = async () => {
        // minimal validation
        if (!form.name.trim()) {
            alert("Product name is required.");
            return;
        }
        if (!form.category.trim()) {
            alert("Category is required.");
            return;
        }
        setSaving(true);

        // Build FormData if you plan to upload images
        const fd = new FormData();
        fd.append("payload", JSON.stringify(form));
        images.forEach((img, i) => fd.append("images", img.file, `image_${i}.jpg`));

        // TODO: call your API here
        await new Promise((r) => setTimeout(r, 800));

        setSaving(false);
        alert("Product created (mock). Plug in your API call in onSave().");
        // navigate("/pharmacy/inventory") if you want
    };

    return (
        <div className="overview">
            {/* Header */}
            <div className="overview__header">
                <CustomText variant="text-heading-H2">Add product</CustomText>
                <div className="overview__actions">
                    <Button
                        text="Cancel"
                        variant="ghost"
                        className="btn-compact"
                        onClick={() => navigate(-1)}
                    />
                    <Button
                        text={saving ? "Saving..." : "Save product"}
                        className="btn-compact"
                        onClick={onSave}
                        disabled={saving}
                    />
                </div>
            </div>

            <section className="panel product-form">
                <div className="product-grid">
                    {/* LEFT — FORM */}
                    <div className="product-col">
                        {/* Basic */}
                        <div className="form-section">
                            <div className="section-title">Basic information</div>
                            <div className="form-grid">
                                <div className="field">
                                    <label>Name<span className="req">*</span></label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => update("name", e.target.value)}
                                        placeholder="e.g., Amoxicillin 500mg"
                                    />
                                </div>
                                <div className="field">
                                    <label>Brand</label>
                                    <input
                                        value={form.brand}
                                        onChange={(e) => update("brand", e.target.value)}
                                        placeholder="e.g., Pfizer"
                                    />
                                </div>
                                <div className="field">
                                    <label>Category<span className="req">*</span></label>
                                    <input
                                        value={form.category}
                                        onChange={(e) => update("category", e.target.value)}
                                        placeholder="e.g., Antibiotics"
                                        list="category-suggestions"
                                    />
                                    <datalist id="category-suggestions">
                                        <option>Antibiotics</option>
                                        <option>Analgesics</option>
                                        <option>Antihistamines</option>
                                        <option>Vitamins</option>
                                    </datalist>
                                </div>
                                <div className="field">
                                    <label>SKU</label>
                                    <input
                                        value={form.sku}
                                        onChange={(e) => update("sku", e.target.value)}
                                        placeholder="Internal code"
                                    />
                                </div>
                                <div className="field">
                                    <label>Barcode</label>
                                    <input
                                        value={form.barcode}
                                        onChange={(e) => update("barcode", e.target.value)}
                                        placeholder="EAN/UPC"
                                    />
                                </div>
                                <div className="field">
                                    <label>Unit</label>
                                    <select
                                        value={form.unit}
                                        onChange={(e) => update("unit", e.target.value as any)}
                                    >
                                        {units.map((u) => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field col-span-2">
                                    <label>Description</label>
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={(e) => update("description", e.target.value)}
                                        placeholder="Short description or usage notes"
                                    />
                                </div>
                                <div className="field toggle">
                                    <label>Prescription required</label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={form.prescriptionRequired}
                                            onChange={(e) => update("prescriptionRequired", e.target.checked)}
                                        />
                                        <span />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="form-section">
                            <div className="section-title">Images</div>
                            <div className="images-row">
                                {images.map((img, i) => (
                                    <div key={i} className="img-tile">
                                        <img src={img.url} alt={`product-${i}`} />
                                        <button className="remove" onClick={() => removeImage(i)}>×</button>
                                    </div>
                                ))}
                                {images.length < 6 && (
                                    <button
                                        className="img-uploader"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24">
                                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        <span>Add images</span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => addImages(e.target.files)}
                                        />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="form-section">
                            <div className="section-title">Pricing</div>
                            <div className="form-grid">
                                <div className="field">
                                    <label>Selling price</label>
                                    <div className="with-prefix">
                                        <span>$</span>
                                        <input
                                            inputMode="decimal"
                                            value={form.price}
                                            onChange={(e) => update("price", e.target.value as any)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Cost</label>
                                    <div className="with-prefix">
                                        <span>$</span>
                                        <input
                                            inputMode="decimal"
                                            value={form.cost}
                                            onChange={(e) => update("cost", e.target.value as any)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Tax rate</label>
                                    <div className="with-suffix">
                                        <input
                                            inputMode="decimal"
                                            value={form.taxRate}
                                            onChange={(e) => update("taxRate", e.target.value as any)}
                                            placeholder="0"
                                        />
                                        <span>%</span>
                                    </div>
                                </div>
                                <div className="field readonly">
                                    <label>Price w/ tax</label>
                                    <div className="calc-pill">${priceWithTax.toFixed(2)}</div>
                                </div>
                                <div className="field readonly">
                                    <label>Margin</label>
                                    <div className={`calc-pill ${margin < 20 ? "warn" : ""}`}>
                                        {margin.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="form-section">
                            <div className="section-title">Inventory</div>
                            <div className="form-grid">
                                <div className="field">
                                    <label>In stock</label>
                                    <input
                                        inputMode="numeric"
                                        value={form.stock}
                                        onChange={(e) => update("stock", e.target.value as any)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="field">
                                    <label>Reorder point</label>
                                    <input
                                        inputMode="numeric"
                                        value={form.reorderPoint}
                                        onChange={(e) => update("reorderPoint", Number(e.target.value))}
                                        placeholder="10"
                                    />
                                </div>
                                <div className="field">
                                    <label>Expiration date</label>
                                    <input
                                        type="date"
                                        value={form.expirationDate}
                                        onChange={(e) => update("expirationDate", e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label>Supplier</label>
                                    <input
                                        value={form.supplier}
                                        onChange={(e) => update("supplier", e.target.value)}
                                        placeholder="Supplier name"
                                    />
                                </div>
                                <div className="field col-span-2">
                                    <label>Notes</label>
                                    <textarea
                                        rows={2}
                                        value={form.notes}
                                        onChange={(e) => update("notes", e.target.value)}
                                        placeholder="Internal notes (not shown to customers)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Attributes */}
                        <div className="form-section">
                            <div className="section-title">Attributes</div>
                            <div className="attributes">
                                {form.attributes.map((row, i) => (
                                    <div key={i} className="attr-row">
                                        <input
                                            placeholder="Name (e.g., Strength)"
                                            value={row.key}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setForm((f) => {
                                                    const attrs = [...f.attributes];
                                                    attrs[i] = { ...attrs[i], key: val };
                                                    return { ...f, attributes: attrs };
                                                });
                                            }}
                                        />
                                        <input
                                            placeholder="Value (e.g., 500 mg)"
                                            value={row.value}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setForm((f) => {
                                                    const attrs = [...f.attributes];
                                                    attrs[i] = { ...attrs[i], value: val };
                                                    return { ...f, attributes: attrs };
                                                });
                                            }}
                                        />
                                        <button
                                            className="icon-btn"
                                            onClick={() => removeAttributeRow(i)}
                                            title="Remove"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    variant="secondary"
                                    className="btn-compact"
                                    text="Add attribute"
                                    onClick={addAttributeRow}
                                />
                            </div>
                        </div>

                        {/* Sticky actions for mobile */}
                        <div className="sticky-actions">
                            <Button
                                text="Cancel"
                                variant="ghost"
                                className="btn-compact"
                                onClick={() => navigate(-1)}
                            />
                            <Button
                                text={saving ? "Saving..." : "Save product"}
                                className="btn-compact"
                                onClick={onSave}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* RIGHT — PREVIEW */}
                    <aside className="product-col preview">
                        <div className="preview-card">
                            <div className="preview-images">
                                {images.length ? (
                                    <img src={images[0].url} alt="primary" />
                                ) : (
                                    <div className="img-placeholder">No image</div>
                                )}
                            </div>
                            <div className="preview-info">
                                <div className="preview-title">
                                    {form.name || "Product name"}
                                </div>
                                <div className="preview-sub">
                                    {form.brand || "Brand"} · {form.unit}
                                </div>
                                <div className="preview-price">
                                    {form.price ? `$${Number(form.price).toFixed(2)}` : "$0.00"}
                                    {form.taxRate ? (
                                        <span className="muted"> / ${priceWithTax.toFixed(2)} w/ tax</span>
                                    ) : null}
                                </div>
                                {form.prescriptionRequired && (
                                    <div className="chip chip-warn">Rx required</div>
                                )}
                                {form.stock !== "" && (
                                    <div className={`stock ${Number(form.stock) <= Number(form.reorderPoint ?? 0) ? "low" : ""}`}>
                                        In stock: {form.stock}
                                    </div>
                                )}
                                {form.category && (
                                    <div className="chip">{form.category}</div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    );
}