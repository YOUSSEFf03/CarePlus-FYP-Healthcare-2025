import React, { useEffect, useMemo, useState } from "react";
import FileUploader from "../../components/Inputs/FileUploader"; // ← adjust the path to your FileUploader
import Button from "../../components/Button/Button";       // adjust if needed

export type AttachmentItem = {
    id: string;
    name: string;
    type: "image" | "pdf";
    size: number;         // bytes
    url: string;          // object URL for preview / download
    addedBy: "Doctor" | "Patient";
    addedAt: string;      // ISO datetime
};

type Props = {
    value: AttachmentItem[];
    onChange: (list: AttachmentItem[]) => void;
    defaultAddedBy?: "Doctor" | "Patient";
};

export default function AttachmentsPanel({
    value,
    onChange,
    defaultAddedBy = "Doctor",
}: Props) {
    const [draftFile, setDraftFile] = useState<File | null>(null);
    const [addedBy, setAddedBy] = useState<"Doctor" | "Patient">(defaultAddedBy);

    // When a file is picked in FileUploader, add it to the list, then clear uploader
    useEffect(() => {
        if (!draftFile) return;
        const isImg = draftFile.type.startsWith("image/");
        const isPdf = draftFile.type === "application/pdf";
        if (!isImg && !isPdf) { setDraftFile(null); return; }

        const item: AttachmentItem = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: draftFile.name,
            type: isImg ? "image" : "pdf",
            size: draftFile.size,
            url: URL.createObjectURL(draftFile),
            addedBy,
            addedAt: new Date().toISOString(),
        };
        onChange([item, ...value]);
        // Clear the FileUploader so it’s ready for another file
        setDraftFile(null);

        // Cleanup URL when the item leaves the list
        return () => URL.revokeObjectURL(item.url);
    }, [draftFile]); // eslint-disable-line react-hooks/exhaustive-deps

    const totalSize = useMemo(
        () => value.reduce((s, v) => s + v.size, 0),
        [value]
    );

    const remove = (id: string) => {
        const item = value.find(v => v.id === id);
        onChange(value.filter(v => v.id !== id));
        if (item) URL.revokeObjectURL(item.url);
    };

    return (
        <div className="attach">
            {/* Uploader using your component */}
            <div className="card" style={{ padding: 12 }}>
                <div className="card-title">Add attachment</div>
                <p className="muted" style={{ marginTop: -2 }}>
                    Images or PDFs. Choose who added the file, then upload.
                </p>

                <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "8px 0 10px" }}>
                    <label style={{ fontWeight: 600 }}>Added by</label>
                    <select
                        value={addedBy}
                        onChange={(e) => setAddedBy(e.target.value as "Doctor" | "Patient")}
                        aria-label="Added by"
                        style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px" }}
                    >
                        <option>Doctor</option>
                        <option>Patient</option>
                    </select>
                </div>

                {/* Your existing FileUploader (single file) */}
                <FileUploader
                    label=""
                    description="Click to upload or drag & drop"
                    value={draftFile}
                    onChange={setDraftFile}
                    accept="image/*,application/pdf"
                    maxSizeMB={10}
                />
                <div className="muted" style={{ marginTop: 8 }}>
                    {value.length} file{value.length !== 1 ? "s" : ""} • {formatBytes(totalSize)}
                </div>
            </div>

            {/* Gallery / list */}
            {value.length > 0 ? (
                <div className="attach-grid" style={{ marginTop: 12 }}>
                    {value.map((a) => (
                        <div key={a.id} className="attach-card">
                            <div className="attach-preview">
                                {a.type === "image" ? (
                                    <img src={a.url} alt={a.name} />
                                ) : (
                                    <div className="attach-pdf">
                                        <span className="attach-pdf-icon" aria-hidden>📄</span>
                                        <a href={a.url} target="_blank" rel="noreferrer">Open PDF</a>
                                    </div>
                                )}
                            </div>

                            <div className="attach-meta">
                                <div className="attach-name" title={a.name}>{a.name}</div>
                                <div className="attach-sub">
                                    <span>{formatBytes(a.size)}</span>
                                    <span>•</span>
                                    <span>{a.addedBy}</span>
                                    <span>•</span>
                                    <time dateTime={a.addedAt}>{new Date(a.addedAt).toLocaleString()}</time>
                                </div>
                            </div>

                            <div className="attach-actions">
                                <a href={a.url} download={a.name}><Button variant="tertiary" text="Download" /></a>
                                <Button variant="ghost" text="Remove" onClick={() => remove(a.id)} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="muted">No attachments yet.</div>
            )}
        </div>
    );
}

function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    const kb = n / 1024; if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024; return `${mb.toFixed(1)} MB`;
}