import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyReply } from 'fastify';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const res = http.getResponse<FastifyReply>();

    // 1️⃣ باتش عشان Fastify يفهم دالة setHeader بتاعة Express
    if (!(res as any).setHeader) {
      (res as any).setHeader = (name: string, value: string) => {
        res.header(name, value);
      };
    }

    // 2️⃣ باتش عشان Fastify يفهم دالة end ويبعت الرد فعلاً للمتصفح
    if (!(res as any).end) {
      (res as any).end = () => {
        // Passport بيحط statusCode = 302، فإحنا بناخدها ونديها لـ Fastify
        if ((res as any).statusCode) {
          res.status((res as any).statusCode);
        }
        // هنا بنقفل الريكويست ونبعت للمتصفح عشان يعمل الـ Redirect
        res.send();
      };
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
