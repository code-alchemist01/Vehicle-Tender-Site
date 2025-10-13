import { PasswordValidator } from './password-validator';

describe('PasswordValidator', () => {
  describe('validate', () => {
    it('should reject weak passwords', () => {
      const result = PasswordValidator.validate('123456');
      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject common passwords', () => {
      const result = PasswordValidator.validate('password');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Bu şifre çok yaygın kullanılıyor, daha güvenli bir şifre seçin');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = PasswordValidator.validate('password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Şifre en az bir büyük harf içermelidir');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = PasswordValidator.validate('PASSWORD123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Şifre en az bir küçük harf içermelidir');
    });

    it('should reject passwords without numbers', () => {
      const result = PasswordValidator.validate('Password!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Şifre en az bir rakam içermelidir');
    });

    it('should reject passwords without special characters', () => {
      const result = PasswordValidator.validate('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Şifre en az bir özel karakter içermelidir (!@#$%^&* vb.)');
    });

    it('should reject passwords that are too short', () => {
      const result = PasswordValidator.validate('Pass1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Şifre en az 8 karakter olmalıdır');
    });

    it('should reject passwords with sequential characters', () => {
      const result = PasswordValidator.validate('Password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Şifre ardışık karakterler içermemelidir (123, abc vb.)');
    });

    it('should reject passwords with too many repeated characters', () => {
      const result = PasswordValidator.validate('Passsssword1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Şifre çok fazla tekrarlanan karakter içermemelidir');
    });

    it('should accept strong passwords', () => {
      const result = PasswordValidator.validate('MyStr0ng!P@ssw0rd');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(['strong', 'very-strong']).toContain(result.strength);
    });

    it('should accept another strong password', () => {
      const result = PasswordValidator.validate('Secure#2024$Pass');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(['strong', 'very-strong']).toContain(result.strength);
    });
  });

  describe('generateStrongPassword', () => {
    it('should generate a password of specified length', () => {
      const password = PasswordValidator.generateStrongPassword(12);
      expect(password.length).toBe(12);
    });

    it('should generate a strong password by default', () => {
      const password = PasswordValidator.generateStrongPassword();
      const result = PasswordValidator.validate(password);
      expect(result.isValid).toBe(true);
      expect(['strong', 'very-strong']).toContain(result.strength);
    });

    it('should generate different passwords each time', () => {
      const password1 = PasswordValidator.generateStrongPassword();
      const password2 = PasswordValidator.generateStrongPassword();
      expect(password1).not.toBe(password2);
    });
  });
});