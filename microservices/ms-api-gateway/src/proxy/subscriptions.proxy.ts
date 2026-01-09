import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  basePath: "/subscriptions",
  target: process.env.MS_SUBSCRIPTIONS_URL,
  serviceName: "Subscriptions",
});
