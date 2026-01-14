import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  target: process.env.MS_COMPANIES_URL,
  serviceName: "Companies",
});
