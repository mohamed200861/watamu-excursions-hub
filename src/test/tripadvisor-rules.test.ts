import { describe, expect, it } from "vitest";
import { agencySchema } from "@/lib/seo";
import { DEFAULT_TRIPADVISOR } from "@/lib/content-types";

describe("Tripadvisor in structured data", () => {
  it("lists the Tripadvisor profile in sameAs", () => {
    expect(agencySchema("254742161072", DEFAULT_TRIPADVISOR).sameAs).toContain(DEFAULT_TRIPADVISOR);
  });
  it("uses the Tripadvisor business name as alternateName", () => {
    expect(agencySchema("254742161072").alternateName).toBe("Africano Di Africa Kenya Safari Tours");
  });
  it("never publishes ratings or reviews", () => {
    const s = agencySchema("254742161072") as Record<string, unknown>;
    expect(s["aggregateRating"]).toBeUndefined();
    expect(s["review"]).toBeUndefined();
  });
});
