// TODO: Replace with real @aws-sdk/client-s3 when S3 bucket is provisioned

export const s3 = {
  upload: async (
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<{ key: string; url: string }> => {
    console.log(`[S3 MOCK] Upload: ${key} (${contentType}, ${body.byteLength} bytes)`);
    return { key, url: `https://mock-s3.example.com/${key}` };
  },

  getSignedUrl: async (key: string): Promise<string> =>
    `https://mock-s3.example.com/${key}?signed=1`,

  delete: async (key: string): Promise<void> => {
    console.log(`[S3 MOCK] Delete: ${key}`);
  },
};
