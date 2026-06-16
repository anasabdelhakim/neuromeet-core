declare namespace Bun {
  const password: {
    hash(password: string | Buffer): Promise<string>;
    verify(password: string | Buffer, hash: string): Promise<boolean>;
  };
}
