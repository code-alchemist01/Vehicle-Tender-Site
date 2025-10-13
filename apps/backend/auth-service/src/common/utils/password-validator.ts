export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;
  
  // Common weak passwords to check against
  private static readonly COMMON_PASSWORDS = [
    '123456', 'password', '123456789', '12345678', '12345', '1234567',
    'qwerty', 'abc123', 'password123', 'admin', 'letmein', 'welcome',
    '123123', 'password1', 'qwerty123', 'iloveyou', 'princess', 'admin123'
  ];

  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Şifre en az ${this.MIN_LENGTH} karakter olmalıdır`);
    } else if (password.length >= this.MIN_LENGTH) {
      score += 1;
    }

    if (password.length > this.MAX_LENGTH) {
      errors.push(`Şifre en fazla ${this.MAX_LENGTH} karakter olabilir`);
    }

    // Character type checks
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasLowercase) {
      errors.push('Şifre en az bir küçük harf içermelidir');
    } else {
      score += 1;
    }

    if (!hasUppercase) {
      errors.push('Şifre en az bir büyük harf içermelidir');
    } else {
      score += 1;
    }

    if (!hasNumbers) {
      errors.push('Şifre en az bir rakam içermelidir');
    } else {
      score += 1;
    }

    if (!hasSpecialChars) {
      errors.push('Şifre en az bir özel karakter içermelidir (!@#$%^&* vb.)');
    } else {
      score += 1;
    }

    // Common password check
    if (this.COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push('Bu şifre çok yaygın kullanılıyor, daha güvenli bir şifre seçin');
      score = Math.max(0, score - 2);
    }

    // Sequential characters check
    if (this.hasSequentialChars(password)) {
      errors.push('Şifre ardışık karakterler içermemelidir (123, abc vb.)');
      score = Math.max(0, score - 1);
    }

    // Repeated characters check
    if (this.hasRepeatedChars(password)) {
      errors.push('Şifre çok fazla tekrarlanan karakter içermemelidir');
      score = Math.max(0, score - 1);
    }

    // Bonus points for length
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Bonus for character variety
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 1;

    const strength = this.calculateStrength(score);
    const isValid = errors.length === 0 && score >= 4;

    return {
      isValid,
      errors,
      strength,
      score
    };
  }

  private static hasSequentialChars(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      '0123456789',
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm'
    ];

    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 3; i++) {
        const subseq = sequence.substring(i, i + 3);
        if (password.toLowerCase().includes(subseq) || 
            password.toLowerCase().includes(subseq.split('').reverse().join(''))) {
          return true;
        }
      }
    }

    return false;
  }

  private static hasRepeatedChars(password: string): boolean {
    // Check for more than 2 consecutive identical characters
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true;
      }
    }

    // Check if more than 50% of characters are the same
    const charCount = new Map<string, number>();
    for (const char of password) {
      charCount.set(char, (charCount.get(char) || 0) + 1);
    }

    for (const count of charCount.values()) {
      if (count > password.length * 0.5) {
        return true;
      }
    }

    return false;
  }

  private static calculateStrength(score: number): 'weak' | 'medium' | 'strong' | 'very-strong' {
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    if (score <= 6) return 'strong';
    return 'very-strong';
  }

  static generateStrongPassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}