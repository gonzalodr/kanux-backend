import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  basePath: "/challenges",
  target: process.env.MS_CHALLENGES_URL,
  serviceName: "Challenges",
});
