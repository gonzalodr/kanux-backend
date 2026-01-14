import express from "express";
import cors from "cors";
import companyRouters from "./modules/company/routes/company.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-companies",
    status: "ok",
  });
});

app.use("/", companyRouters);
//app.use('company/metrics')
//app.use('company/talent')
//app.use('company/contact')

export default app;
