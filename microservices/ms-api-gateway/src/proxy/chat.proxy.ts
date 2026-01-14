import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  target: process.env.MS_CHATS_URL,
  serviceName: "Chats",
});
