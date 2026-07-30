import { validateCollegeEmail } from '../src/common/utils/email-validator.util';
import * as argon2 from 'argon2';

describe('College Email Validator & Argon2 Security Tests', () => {
  describe('validateCollegeEmail', () => {
    it('should allow valid college emails ending in .edu.in or .edu', () => {
      expect(validateCollegeEmail('student@srmist.edu.in')).toBe('student@srmist.edu.in');
      expect(validateCollegeEmail('john.doe@mit.edu')).toBe('john.doe@mit.edu');
      expect(validateCollegeEmail('scholar@cambridge.ac.uk')).toBe('scholar@cambridge.ac.uk');
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
