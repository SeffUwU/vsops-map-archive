declare namespace NodeJS {
  export interface ProcessEnv {
    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    // APP
    APP_INVITE_CODE: string;
  }
}
