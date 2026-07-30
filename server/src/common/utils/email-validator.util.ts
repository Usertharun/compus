import { BadRequestException } from '@nestjs/common';

const COMMERCIAL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'aol.com',
  'zoho.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'gmx.com',
  'yandex.com',
]);

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  'dispostable.com',
  'trashmail.com',
  'yopmail.com',
  'getnada.com',
  'throwawaymail.com',
  'temp-mail.org',
  'maildrop.cc',
  'sharklasers.com',
  'crazymailing.com',
]);

const ALLOWED_EDUCATIONAL_TLDS = [
  '.edu',
  '.edu.in',
  '.ac.in',
  '.ac.uk',
  '.edu.au',
  '.edu.sg',
  '.edu.cn',
  '.edu.tw',
  '.edu.ng',
  '.edu.za',
];

export function validateCollegeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new BadRequestException('Email address is required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(normalizedEmail)) {
    throw new BadRequestException('Invalid email address format');
  }

  const domain = normalizedEmail.split('@')[1];

  if (COMMERCIAL_DOMAINS.has(domain)) {
    throw new BadRequestException(
      `Personal email address '@${domain}' is not allowed. Please use your official college email address.`,
    );
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    throw new BadRequestException('Temporary and disposable email addresses are strictly prohibited.');
  }

  const isEducationalDomain = ALLOWED_EDUCATIONAL_TLDS.some((tld) => domain.endsWith(tld));

  if (!isEducationalDomain) {
    throw new BadRequestException(
      `Domain '@${domain}' is not a recognized college or educational domain. Registration requires an official college email.`,
    );
  }

  return normalizedEmail;
}
