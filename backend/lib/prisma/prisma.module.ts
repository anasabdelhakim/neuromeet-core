import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // عشان تستخدمه في أي مكان من غير ما تعمل Import كل مرة
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // مهم جداً عشان الـ Services التانية تشوفه
})
export class PrismaModule {}
