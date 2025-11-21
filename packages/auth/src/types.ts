import { betterAuth } from "better-auth";
import { getAuthConfig } from "./config";

const dummyConfig = getAuthConfig({
  baseURL: "http://localhost:3000",
  trustedOrigins: [],
});
const auth = betterAuth(dummyConfig);

export type Auth = typeof auth;
