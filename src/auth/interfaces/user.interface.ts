import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    githubId: string;
    name: string;
  };
}
