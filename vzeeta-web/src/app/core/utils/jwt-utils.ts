export class JwtUtils {
  private static decodePayload(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  static isExpired(token: string): boolean {
    const payload = this.decodePayload(token);
    if (!payload || typeof payload['exp'] !== 'number') return true;
    return Date.now() >= (payload['exp'] as number) * 1000;
  }
}
