import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  target: process.env.MS_FEED_URL,
  serviceName: "Feed",
});
