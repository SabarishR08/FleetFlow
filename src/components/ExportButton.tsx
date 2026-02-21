"use client";

export function ExportButton({
  label,
  type,
  format,
}: {
  label: string;
  type: "trips" | "expenses" | "maintenance";
  format: "pdf" | "excel";
}) {
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export?type=${type}&format=${format}`);
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fleetflow-${type}.${format === "pdf" ? "pdf" : "xlsx"}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <button
      className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs uppercase tracking-[0.2em] transition hover:bg-[color:var(--border)]"
      onClick={handleExport}
    >
      Export {label} ({format.toUpperCase()})
    </button>
  );
}
