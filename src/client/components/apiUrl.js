
import getConfig from 'next/config';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
//
// process.env["API_URL"] = serverRuntimeConfig.API_URL || publicRuntimeConfig.API_URL;
// console.log("API_URL = ", process.env.API_URL)
export const API_URL = serverRuntimeConfig.API_URL || publicRuntimeConfig.API_URL
