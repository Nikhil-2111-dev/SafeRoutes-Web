import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || process.env.VITE_COGNITO_USER_POOL_ID || 'dummy-pool-id',
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || process.env.VITE_COGNITO_USER_POOL_CLIENT_ID || 'dummy-client-id',
        loginWith: {
          oauth: {
            domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
            scopes: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
            redirectSignIn: [process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_IN || 'http://localhost:3000/'],
            redirectSignOut: [process.env.NEXT_PUBLIC_OAUTH_REDIRECT_SIGN_OUT || 'http://localhost:3000/'],
            responseType: 'code',
          }
        }
      }
    }
  }, {
    ssr: true // Next.js SSR Support
  });
}
