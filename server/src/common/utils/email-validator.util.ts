import { BadRequestException } from '@nestjs/common';

export const CAMPUS_EMAIL_DOMAIN = 'srmist.edu.in';
export function isCampusEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return /^[a-z0-9._%+-]+@srmist\.edu\.in$/.test(normalized);
}
export function validateCollegeEmail(email: string): string {
  if (!isCampusEmail(email)) throw new BadRequestException('Use your SRM email address ending in @srmist.edu.in.');
  return email.trim().toLowerCase();
}

export function isOwnerEmail(email: string, ownerEmail?: string): boolean {
  return typeof email === 'string' && typeof ownerEmail === 'string' && ownerEmail.trim().length > 0 && email.trim().toLowerCase() === ownerEmail.trim().toLowerCase();
}

export function isAllowedAccountEmail(email: string, role: string, ownerEmail?: string): boolean {
  return isCampusEmail(email) || role === 'COMMUNITY_ACCOUNT' || (role === 'SUPER_ADMIN' && isOwnerEmail(email, ownerEmail));
}
