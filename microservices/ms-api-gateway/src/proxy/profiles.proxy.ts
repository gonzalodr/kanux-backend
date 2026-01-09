import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  basePath: "/profiles",
  target: process.env.MS_PROFILES_URL,
  serviceName: "Profiles",
});
