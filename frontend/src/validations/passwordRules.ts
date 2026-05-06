export const passwordRules = [
  {
    test: (password: string) => password.length >= 8 && password.length <= 20,
    message: '8 to 20 characters',
  },
  {
    test: (password: string) => /[A-Z]/.test(password),
    message: 'Require uppercase letter',
  },
  {
    test: (password: string) => /[0-9]/.test(password),
    message: 'Require a number',
  },
  {
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
    message: 'Require a special symbol',
  },
];
