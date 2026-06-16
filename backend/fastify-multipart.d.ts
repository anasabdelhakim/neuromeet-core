import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    file: () => Promise<any>;
    files: (options?: any) => AsyncIterableIterator<any>;
  }
}
