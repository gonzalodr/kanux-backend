import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  target: process.env.MS_AUTH_URL,
  serviceName: "Auth",
});
