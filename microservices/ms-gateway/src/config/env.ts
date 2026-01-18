import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT ||3000, // Default to 3000 to avoid conflicts
  services: {
    auth: {
      url: process.env.MS_AUTH_URL || 'http://localhost:3001',
      context: '/auth'
    },
    profiles: {
      url: process.env.MS_PROFILES_URL || 'http://localhost:3002',
      context: '/profiles'
    },
    challenges: {
      url: process.env.MS_CHALLENGES_URL || 'http://localhost:3003',
      context: '/challenges'
    },
    companies: {
      url: process.env.MS_COMPANIES_URL || 'http://localhost:3004',
      context: '/companies'
    },
    subscriptions: {
      url: process.env.MS_SUBSCRIPTIONS_URL || 'http://localhost:3005',
      context: '/subscriptions'
    },
    messages: {
      url: process.env.MS_MESSAGES_URL || 'http://localhost:3006',
      context: '/messages'
    },
    feed: {
      url: process.env.MS_FEED_URL || 'http://localhost:3007',
      context: '/feed'
    }
  }
};
