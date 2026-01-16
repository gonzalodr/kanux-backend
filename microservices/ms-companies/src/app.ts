import express from "express";
import cors from "cors";
import companyRouters from './modules/company/routes/company.routes'
import talentRouters from './modules/talent/routes/talent.routes'
import metricRouters from './modules/metrics/routes/metrics.routes'
import contactRouters from './modules/contact/routes/contact.routes'

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-companies",
    status: "ok"
  });
});

app.use('/company',companyRouters)
app.use('/company/metrics',metricRouters)
app.use('/company/talent',talentRouters)
app.use('/company/contact',contactRouters)

export default app;
