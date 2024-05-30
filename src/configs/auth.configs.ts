import "dotenv/config";

export const authConfigs = {
  secretKey: process.env.TOKEN_SECRET_KEY || "ojfdajEkhfHE4326.>",
};

// Gmail
export const credentials = {
  installed: {
    client_id: process.env.CLIENT_ID || "174752201248-quaa133vshjvkbj75frin5sr3rciiil5.apps.googleusercontent.com",
    // project_id: process.env.PROJECT_ID,
    // auth_uri: process.env.AUTH_URI,
    // token_uri: process.env.TOKEN_URI,
    // auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_secret: process.env.CLIENT_SECRET || "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",
    redirect_uris: process.env.REDIRECT_URIS || "http://localhost",
  },
};

export const tokens = {
  // access_token: process.env.ACCESS_TOKEN,
  refresh_token: process.env.REFRESH_TOKEN || "1//0hLnpzjvngvK0CgYIARAAGBESNwF-L9IrCUPikHeaL1ZNdqRpf94q-FIk9q1WRNmRExPGTgGO1La7JuE9wdnBti6Ng1BWiqXqR5M",
  // scope: process.env.SCOPE,
  // token_type: process.env.TOKEN_TYPE,
};

// export const code = process.env.CODE;

