import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private configService: ConfigService) {
    }
    use(req: Request, res: Response, next: NextFunction) {
        const apiKey = req.headers.authorization;
        if (apiKey !== this.configService.get<string>('API_KEY')) {
            res.status(401).send({ error: 'Unauthorized' });
            return;
        }
        next();
    }
}
