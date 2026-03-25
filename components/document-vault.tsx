"use client";

import { useMemo, useState } from "react";
import { UploadButton } from "@/lib/upload-thing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentRecord } from "@/lib/phase-one-types";
import { AlertTriangle, FileBadge2, FileText, ShieldCheck } from "lucide-react";

const documentTypes = [
  "Passport scan",
  "Visa copy",
  "Flight ticket",
  "Hotel voucher",
  "Travel insurance",
  "Emergency contact",
  "Other",
] as const;

type DocumentType = (typeof documentTypes)[number];

export default function DocumentVault({
  tripId,
  tripTitle,
  tripStartDate,
  initialDocuments,
}: {
  tripId: string;
  tripTitle: string;
  tripStartDate: string;
  initialDocuments: DocumentRecord[];
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const [draft, setDraft] = useState<{
    name: string;
    type: DocumentType;
    url: string;
    expiryDate: string;
  }>({
    name: "",
    type: documentTypes[0],
    url: "",
    expiryDate: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passportWarning = useMemo(() => {
    const passport = documents.find((document) =>
      /passport/i.test(document.type) || /passport/i.test(document.name)
    );

    if (!passport?.expiryDate) return null;

    const expiry = new Date(passport.expiryDate);
    const tripStart = new Date(tripStartDate);
    const sixMonthsBeforeTrip = new Date(tripStart);
    sixMonthsBeforeTrip.setMonth(tripStart.getMonth() + 6);

    return expiry <= sixMonthsBeforeTrip
      ? "Passport expiry is within 6 months of the trip start. Renew it before travel."
      : null;
  }, [documents, tripStartDate]);

  async function saveDocument() {
    if (!draft.url || !draft.name.trim()) {
      setError("Upload a file and enter a document name first.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/documents/${tripId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save document.");
      }

      setDocuments((current) => [data as DocumentRecord, ...current]);
      setDraft({
        name: "",
        type: documentTypes[0],
        url: "",
        expiryDate: "",
      });
      setSuccessMessage("Document saved. It is now available inside this trip vault.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save document.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="app-shell space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <p className="section-label">Document Vault</p>
            <CardTitle className="text-[40px] text-white">{tripTitle}</CardTitle>
            <p className="text-sm leading-7 text-[#8B9BB4]">
              Keep trip-critical files in one secure place so passports, tickets, insurance, and
              hotel confirmations stay easy to access before departure.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <ShieldCheck className="size-5" />
              </div>
              <p className="text-sm text-[#8B9BB4]">Stored documents</p>
              <p className="mt-2 text-2xl font-semibold text-white">{documents.length}</p>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <FileBadge2 className="size-5" />
              </div>
              <p className="text-sm text-[#8B9BB4]">Trip start</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {new Date(tripStartDate).toLocaleDateString()}
              </p>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[#00C2FF]">
                <FileText className="size-5" />
              </div>
              <p className="text-sm text-[#8B9BB4]">Vault status</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {documents.length > 0 ? "Ready" : "Start uploading"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-white">Upload a document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UploadButton
              endpoint="documentUploader"
              appearance={{
                button:
                  "ut-ready:bg-[linear-gradient(135deg,#1B3A6B,#00C2FF)] ut-ready:text-white ut-ready:border-0",
                container: "w-full",
              }}
              onClientUploadComplete={(files) => {
                const file = files?.[0];
                if (!file) return;
                setDraft((current) => ({
                  ...current,
                  url: file.ufsUrl,
                  name: current.name || file.name,
                }));
              }}
              onUploadError={(uploadError: Error) => {
                setError(uploadError.message);
              }}
            />

            <input
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Passport front page"
              className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
            />
            <select
              value={draft.type}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  type: event.target.value as DocumentType,
                }))
              }
              className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
            >
              {documentTypes.map((type) => (
                <option key={type} value={type} className="bg-[#0F1117]">
                  {type}
                </option>
              ))}
            </select>
            <input
              value={draft.expiryDate}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  expiryDate: event.target.value,
                }))
              }
              type="date"
              className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
            />

            {error ? (
              <div className="rounded-[14px] border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#FFB4B4]">
                {error}
              </div>
            ) : successMessage ? (
              <div className="rounded-[14px] border border-[#00C2FF]/20 bg-[#00C2FF]/8 px-4 py-3 text-sm text-[#D8F5FF]">
                {successMessage}
              </div>
            ) : null}

            <Button onClick={saveDocument} className="w-full" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Document"}
            </Button>
          </CardContent>
        </Card>
      </section>

      {passportWarning ? (
        <Card>
          <CardContent className="flex gap-3 pt-6 text-[#F8D7A1]">
            <AlertTriangle className="mt-1 size-5 shrink-0 text-[#F59E0B]" />
            <p className="text-sm leading-7">{passportWarning}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-white">Stored trip documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.length > 0 ? (
            documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-white">{document.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#4A5568]">
                    {document.type}
                    {document.expiryDate
                      ? ` · expires ${new Date(document.expiryDate).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <a href={document.url} target="_blank" rel="noreferrer">
                  <Button variant="outline">Open</Button>
                </a>
              </div>
            ))
          ) : (
            <div className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-[#8B9BB4]">
              No travel documents are stored yet. Upload passports, tickets, hotel vouchers,
              insurance, or emergency contacts so everything stays easy to access before departure.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
