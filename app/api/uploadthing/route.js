import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// ✅ works with your version
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
