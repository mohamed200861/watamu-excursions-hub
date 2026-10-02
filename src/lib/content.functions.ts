import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getSiteContent = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ lang: z.enum(["it", "en"]) }).parse(d))
  .handler(async ({ data }) => {
    const { loadRaw, buildContent } = await import("./content.server");
    return buildContent(await loadRaw(), data.lang);
  });
