const strongPasswordPattern = /^(?=.*\p{L})(?=.*\p{N})(?=.*[^\p{L}\p{N}\s]).{8,}$/u;

export function isStrongPassword(password) {
  return typeof password === 'string' && strongPasswordPattern.test(password);
}
