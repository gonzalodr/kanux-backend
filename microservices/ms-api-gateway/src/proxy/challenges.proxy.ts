import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  target: process.env.MS_CHALLENGES_URL,
  serviceName: "Challenges",
});
