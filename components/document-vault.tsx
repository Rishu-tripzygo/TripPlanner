"use client";

import { useMemo, useState } from "react";
import { UploadButton } from "@/lib/upload-thing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentRecord } from "@/lib/phase-one-types";
import {
  AlertTriangle,
  FileBadge2,
  FileText,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";

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

const surfaceCard =
  "border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,237,0.88))] text-[#1A1C1B] backdrop-blur-[18px]";

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

  const missingDocumentPrompts = useMemo(() => {
    const checks = [
      { label: "Passport or government ID", patterns: [/passport/i, /\bid\b/i] },
      { label: "Flight or rail ticket", patterns: [/flight/i, /ticket/i, /rail/i] },
      {
        label: "Hotel or stay confirmation",
        patterns: [/hotel/i, /voucher/i, /stay/i, /booking/i],
      },
      { label: "Travel insurance", patterns: [/insurance/i] },
      { label: "Emergency contact details", patterns: [/emergency/i, /contact/i] },
    ];

    return checks.filter(
      (check) =>
        !documents.some((document) =>
          check.patterns.some(
            (pattern) => pattern.test(document.type) || pattern.test(document.name)
          )
        )
    );
  }, [documents]);

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

  async function removeDocument(documentId: string) {
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/documents/${tripId}?documentId=${documentId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove document.");
      }

      setDocuments((current) => current.filter((document) => document.id !== documentId));
      setSuccessMessage("Document removed from the vault.");
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove document.");
    }
  }

  return (
    <div className="landing-shell space-y-8 px-4 py-8 sm:px-5 lg:px-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className={surfaceCard}>
          <CardHeader>
            <p className="section-label">Document Vault</p>
            <CardTitle className="font-[family-name:var(--font-noto-serif)] text-[40px] text-[#024785]">
              {tripTitle}
            </CardTitle>
            <p className="text-sm leading-7 text-[#61738C]">
              Keep trip-critical files in one secure place so passports, tickets, insurance, and
              hotel confirmations stay easy to access before departure.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <ShieldCheck className="size-5" />
              </div>
              <p className="text-sm text-[#61738C]">Stored documents</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">{documents.length}</p>
            </div>
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <FileBadge2 className="size-5" />
              </div>
              <p className="text-sm text-[#61738C]">Trip start</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">
                {new Date(tripStartDate).toLocaleDateString()}
              </p>
            </div>
            <div className="rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-5">
              <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                <FileText className="size-5" />
              </div>
              <p className="text-sm text-[#61738C]">Vault status</p>
              <p className="mt-2 text-2xl font-semibold text-[#024785]">
                {documents.length > 0 ? "Ready" : "Start uploading"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={surfaceCard}>
          <CardHeader>
            <CardTitle className="text-2xl text-[#024785]">Upload a document</CardTitle>
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
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="Passport front page"
              className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            />
            <select
              value={draft.type}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  type: event.target.value as DocumentType,
                }))
              }
              className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            >
              {documentTypes.map((type) => (
                <option key={type} value={type} className="bg-white text-[#1A1C1B]">
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
              className="w-full rounded-[16px] border border-[rgba(20,81,139,0.1)] bg-white px-4 py-3 text-sm text-[#1A1C1B] outline-none transition focus:border-[#14518b]/20"
            />

            {error ? (
              <div className="rounded-[14px] border border-[#EF4444]/30 bg-[#FDECEC] px-4 py-3 text-sm text-[#B84A43]">
                {error}
              </div>
            ) : successMessage ? (
              <div className="rounded-[14px] border border-[#14518b]/15 bg-[#EEF4FB] px-4 py-3 text-sm text-[#14518b]">
                {successMessage}
              </div>
            ) : null}

            <Button onClick={saveDocument} className="w-full" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Document"}
            </Button>
            <div className="rounded-[16px] border border-[rgba(20,81,139,0.08)] bg-white/72 px-4 py-3 text-sm leading-7 text-[#61738C]">
              Keep only practical travel files here. Avoid uploading payment details or anything
              you would not want exposed if a shared device is lost.
            </div>
          </CardContent>
        </Card>
      </section>

      {passportWarning ? (
        <Card className="border-[#F59E0B]/18 bg-[#FFF7ED] text-[#8A4B16]">
          <CardContent className="flex gap-3 pt-6 text-[#8A4B16]">
            <AlertTriangle className="mt-1 size-5 shrink-0 text-[#F59E0B]" />
            <p className="text-sm leading-7">{passportWarning}</p>
          </CardContent>
        </Card>
      ) : null}

      {missingDocumentPrompts.length > 0 ? (
        <Card className={surfaceCard}>
          <CardHeader>
            <CardTitle className="text-2xl text-[#024785]">
              Still worth adding before departure
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {missingDocumentPrompts.map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] border border-dashed border-[rgba(20,81,139,0.12)] bg-white/70 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-[#EEF2F8] p-3 text-[#14518b]">
                    <Upload className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#024785]">{item.label}</p>
                    <p className="mt-2 text-sm leading-7 text-[#61738C]">
                      Add this so the trip vault is complete before travel day.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className={surfaceCard}>
        <CardHeader>
          <CardTitle className="text-2xl text-[#024785]">Stored trip documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {documents.length > 0 ? (
            documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-3 rounded-[18px] border border-[rgba(20,81,139,0.08)] bg-white/72 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[#024785]">{document.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8A96A8]">
                    {document.type}
                    {document.expiryDate
                      ? ` · expires ${new Date(document.expiryDate).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href={document.url} target="_blank" rel="noreferrer">
                    <Button variant="outline">Open</Button>
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void removeDocument(document.id)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="size-4" />
                      Remove
                    </span>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[18px] border border-dashed border-[rgba(20,81,139,0.12)] bg-white/68 p-5 text-sm leading-7 text-[#61738C]">
              No travel documents are stored yet. Upload passports, tickets, hotel vouchers,
              insurance, or emergency contacts so everything stays easy to access before departure.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
