import { createServiceProxy } from "./createServiceProxy";

export default createServiceProxy({
  basePath: "/chats",
  target: process.env.MS_CHATS_URL,
  serviceName: "Chats",
});
