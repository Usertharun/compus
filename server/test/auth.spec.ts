import { validateCollegeEmail } from '../src/common/utils/email-validator.util';
import * as argon2 from '@node-rs/argon2';

describe('College Email Validator & Argon2 Security Tests', () => {
  describe('validateCollegeEmail', () => {
    it('accepts only SRM emails and normalizes case and surrounding whitespace', () => {
      expect(validateCollegeEmail('student@srmist.edu.in')).toBe('student@srmist.edu.in');
      expect(validateCollegeEmail(' STUDENT@SRMIST.EDU.IN ')).toBe('student@srmist.edu.in');
    });

    it('should reject commercial email domains (gmail, yahoo, outlook, etc.)', () => {
      expect(() => validateCollegeEmail('user@gmail.com')).toThrow();
      expect(() => validateCollegeEmail('user@yahoo.com')).toThrow();
      expect(() => validateCollegeEmail('user@outlook.com')).toThrow();
    });

    it('should reject disposable/temporary email domains', () => {
      expect(() => validateCollegeEmail('user@10minutemail.com')).toThrow();
      expect(() => validateCollegeEmail('user@mailinator.com')).toThrow();
    });
  });

  it.each(['student@mit.edu', 'student@sub.srmist.edu.in', 'student@srmist.edu.in.evil.com', 'student@srmist.edu.in@evil.com', 'student@fakesrmist.edu.in'])('rejects non-SRM and lookalike addresses: %s', email => {
    expect(() => validateCollegeEmail(email)).toThrow('@srmist.edu.in');
  });

  describe('Argon2 Password Hashing', () => {
    it('should hash and verify passwords using Argon2id', async () => {
      const password = 'Argon2SecurePassword123!';
      const hash = await argon2.hash(password);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$argon2')).toBe(true);

      const isValid = await argon2.verify(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await argon2.verify(hash, 'WrongPassword123!');
      expect(isInvalid).toBe(false);
    });
  });
});
