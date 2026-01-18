import app from './app';
import { config } from './config/env';

app.listen(config.port, () => {
  console.log(`API Gateway running on port ${config.port}`);
  console.log('Registered Proxies:');
  Object.values(config.services).forEach(service => {
    console.log(`- ${service.context} -> ${service.url}`);
  });
});
