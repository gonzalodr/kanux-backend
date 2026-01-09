import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  basePath: "/auth",
  target: process.env.MS_AUTH_URL,
  serviceName: "Auth",
});
