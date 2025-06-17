// envConfig.ts
import {environmentTypes} from '../../utils/Constants.tsx';

const environments = {
  development: {
    baseURL: 'https://dev-api.ameya.ca',
    privacyUrl: 'https://www.dev.ameya.ca/privacy-policy',
    termsUrl: 'https://www.dev.ameya.ca/terms-of-use',
  },
  production: {
    baseURL: 'https://app-api.ameya.ca/',
    privacyUrl: 'https://www.app.ameya.ca/privacy-policy',
    termsUrl: 'https://www.app.ameya.ca/terms-of-use',
  },
  qa: {
    baseURL: 'https://qa-api.ameya.ca',
  },
};

const getCurrentEnvironment = (): any => {
  const env = environmentTypes.development; // Adjust depending on your environment variable setup
  // @ts-ignore
  return environments[env];
};

export default getCurrentEnvironment();
