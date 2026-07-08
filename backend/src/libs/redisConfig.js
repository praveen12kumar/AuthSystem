import { Redis } from '@upstash/redis'

import { REDIS_REST_TOKEN,REDIS_URL } from '../config/serverConfig.js';

const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_REST_TOKEN,
})

export default redis;


