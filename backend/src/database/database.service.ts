import { Injectable,OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'lib/prisma/_generated/prisma/edge';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit
OnModuleInit {
    async onModuleInit() {
        await this.$connect();
    }
}
