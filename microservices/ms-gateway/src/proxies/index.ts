import { config } from '../config/env';

export interface ProxyConfig {
  context: string | string[];
  target: string;
  pathRewrite?: { [key: string]: string };
}

export const proxyConfigs: ProxyConfig[] = [
  {
    context: config.services.auth.context,
    target: config.services.auth.url,
    pathRewrite: { '^/auth': '' },
  },
  {
    context: config.services.profiles.context,
    target: config.services.profiles.url,
    pathRewrite: { '^/profiles': '' },
  },
  {
    context: config.services.challenges.context,
    target: config.services.challenges.url,
    pathRewrite: { '^/challenges': '' },
  },
  {
    context: config.services.companies.context,
    target: config.services.companies.url,
    pathRewrite: { '^/companies': '' },
  },
  {
    context: config.services.subscriptions.context,
    target: config.services.subscriptions.url,
    pathRewrite: { '^/subscriptions': '' },
  },
  {
    context: config.services.messages.context,
    target: config.services.messages.url,
    pathRewrite: { '^/messages': '' },
  },
  {
    context: config.services.feed.context,
    target: config.services.feed.url,
    pathRewrite: { '^/feed': '' },
  },
];
