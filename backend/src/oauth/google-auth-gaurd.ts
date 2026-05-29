import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // ========================================================
  // 👉 NEW: Force Google to show the account selection screen
  // ========================================================
  getAuthenticateOptions(context: ExecutionContext) {
    return {
      prompt: 'select_account',
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const req = http.getRequest<FastifyRequest>();
    const res = http.getResponse<FastifyReply>();

    // 1️⃣ باتش عشان Fastify يفهم دالة setHeader بتاعة Express
    if (!(res as any).setHeader) {
      (res as any).setHeader = (name: string, value: string) => {
        res.header(name, value);
      };
    }

    // 2️⃣ Intercept the redirect to manually save the session before redirecting to Google
    // This guarantees the OAuth state is saved in the session before the browser navigates away.
    const originalRedirect = res.redirect.bind(res);
    (res as any).redirect = async function (
      statusCode: number | string,
      url?: string,
    ) {
      const session = (req as any).session;
      if (session && typeof session.save === 'function') {
        try {
          await new Promise<void>((resolve, reject) => {
            session.save((err: any) => {
              if (err) reject(err);
              else resolve();
            });
          });
        } catch (err) {
          console.error('Session save error before redirect:', err);
        }
      }

      if (url === undefined) {
        return originalRedirect(statusCode as string);
      }
      return originalRedirect(statusCode as number, url);
    };

    // 3️⃣ باتش عشان Fastify يفهم دالة end ويبعت الرد فعلاً للمتصفح
    if (!(res as any).end) {
      (res as any).end = () => {
        if ((res as any).statusCode) {
          res.status((res as any).statusCode);
        }
        res.send();
      };
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
