import { describe, expect, it } from "vitest";
import { licenseActive } from "@/lib/content-types";
import { legalComplete } from "@/lib/legal";
const today = new Date("2026-10-06T12:00:00Z");
describe("guide licence badge", () => {
  it("hidden when text empty", () => expect(licenseActive({ text: "", number: "1", expires: "2030-01-01" }, today)).toBe(false));
  it("shown when text filled and not expired", () => expect(licenseActive({ text: "Guida TRA", number: "", expires: "2026-10-06" }, today)).toBe(true));
  it("hidden after expiry", () => expect(licenseActive({ text: "Guida TRA", number: "", expires: "2026-10-05" }, today)).toBe(false));
});
describe("legal indexing", () => {
  const base = { name: "ECO TOURS AND SAFARI'S (Africano)", address: "", email: "eazyafricanah@gmail.com", phone: "+254742161072", license: "", retention: "", transfers: "", law: "Legge del Kenya" };
  it("address not required", () => expect(legalComplete({ ...base, retention: "12 mesi", transfers: "UE, Kenya" })).toBe(true));
  it("noindex while retention and transfers empty", () => expect(legalComplete(base)).toBe(false));
});
