import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  basePath: "/feed",
  target: process.env.MS_FEED_URL,
  serviceName: "Feed",
});
