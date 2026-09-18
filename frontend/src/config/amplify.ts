import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || process.env.VITE_COGNITO_USER_POOL_ID || 'dummy-pool-id',
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || process.env.VITE_COGNITO_USER_POOL_CLIENT_ID || 'dummy-client-id',
      }
    }
  }, {
    ssr: true // Next.js SSR Support
  });
}
