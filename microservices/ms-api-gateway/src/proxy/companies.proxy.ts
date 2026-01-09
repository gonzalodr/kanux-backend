import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  basePath: "/companies",
  target: process.env.MS_COMPANIES_URL,
  serviceName: "Companies",
});
