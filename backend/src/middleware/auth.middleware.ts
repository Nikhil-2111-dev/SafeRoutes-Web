import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Extend the Express Request to include our authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Instantiate the verifier globally so it caches the JWKS from AWS. 
// Do not instantiate this inside the request handler or it will fetch on every request and timeout!
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID || '',
  tokenUse: "id",
  clientId: process.env.COGNITO_USER_POOL_CLIENT_ID || '',
});

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!process.env.COGNITO_USER_POOL_ID || !process.env.COGNITO_USER_POOL_CLIENT_ID) {
      console.error("Backend missing Cognito Env Vars");
      return res.status(500).json({ error: "Server authentication misconfigured" });
    }

    const payload = await verifier.verify(token);
    
    req.user = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      phoneNumber: payload.phone_number,
      birthdate: payload.birthdate,
      gender: payload.gender,
      address: payload.address
    };

    next();
  } catch (err) {
    console.error("JWT Verification failed:", err);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
