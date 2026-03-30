// TODO: Replace with real Redis client (ioredis) when Redis is provisioned

export const redis = {
  get: async (key: string): Promise<string | null> => {
    console.log(`[REDIS MOCK] GET ${key}`);
    return null;
  },

  set: async (key: string, value: string, _ex?: string, _ttl?: number): Promise<'OK'> => {
    console.log(`[REDIS MOCK] SET ${key}`);
    return 'OK';
  },

  del: async (key: string): Promise<number> => {
    console.log(`[REDIS MOCK] DEL ${key}`);
    return 1;
  },
};
