import { describe, expect, it } from "vitest";
import { sentenceList, whatsappTextHref } from "@/lib/content-types";
import { photoProblems, repairable } from "@/lib/photo-check";
import { MIN_PASSWORD, passwordTooShort } from "@/lib/password";
import { buildContent } from "@/lib/content.server";
import en from "@/lib/content-en.json";

const ok = { size: 10, mimetype: "image/webp" };
const photo = { path: "a/b.webp", thumb_path: "a/c-640.webp", width: 10, height: 10, alt: "Elefante" };

describe("delivery rules", () => {
  it("passwords need at least 12 characters", () => {
    expect(MIN_PASSWORD).toBe(12);
    expect(passwordTooShort("12345678901")).toBe(true);
    expect(passwordTooShort("123456789012")).toBe(false);
  });
  it("FAQ lists written in one sentence split on comma + capital", () => {
    expect(sentenceList("Mance, Extra personali, Ingresso al villaggio Masai.")).toEqual(["Mance", "Extra personali", "Ingresso al villaggio Masai"]);
    expect(sentenceList("Cappello, antizanzare e crema solare")).toBeNull();
  });
  it("legal WhatsApp message has no people/date placeholders", () => {
    const href = whatsappTextHref("254742161072", "Ciao Africano! Ho una domanda sulla privacy e sulle condizioni del sito.");
    expect(decodeURIComponent(href)).not.toContain("Persone");
  });
  it("a photo whose file is missing cannot be repaired", () => {
    expect(photoProblems(photo, undefined, ok)).toContain("File della foto mancante");
    expect(repairable(undefined)).toBe(false);
    expect(photoProblems(photo, ok, undefined)).toEqual(["Miniatura mancante"]);
    expect(photoProblems({ ...photo, alt: "IMG-20261002-WA0062" }, ok, ok)).toEqual(["Testo alternativo è un nome di file"]);
  });
  it("hidden photos never reach the public site", () => {
    const raw = { content: { home: {} }, packages: [], photos: [{ id: "1", path: "a/b.webp", thumb_path: "a/c.webp", width: 1, height: 1, caption: "", alt: "x", category: "safari", hidden: true }] };
    expect(buildContent(raw as never, "it").photos).toHaveLength(0);
  });
  it("long safaris use the new addresses", () => {
    const keys = Object.keys(en.packages);
    expect(keys).toContain("masai-mara-nakuru-amboseli-tsavo-est-6-giorni");
    expect(keys).toContain("masai-mara-nakuru-amboseli-taita-hills-tsavo-est-7-giorni");
    expect(keys).not.toContain("grande-kenya-6-giorni");
  });
});
