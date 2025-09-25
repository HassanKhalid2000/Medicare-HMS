import { BadRequestException } from '@nestjs/common';

export interface PasswordRequirements {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: string[];
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: [
    'password',
    'admin',
    'user',
    '123456',
    'qwerty',
    'abc123',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
  ],
};

export class PasswordValidator {
  static validate(
    password: string,
    requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS,
  ): void {
    const errors: string[] = [];

    // Check length
    if (password.length < requirements.minLength) {
      errors.push(`Password must be at least ${requirements.minLength} characters long`);
    }

    if (password.length > requirements.maxLength) {
      errors.push(`Password must not exceed ${requirements.maxLength} characters`);
    }

    // Check uppercase requirement
    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check lowercase requirement
    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check numbers requirement
    if (requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Check special characters requirement
    if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check forbidden patterns
    const lowerPassword = password.toLowerCase();
    for (const pattern of requirements.forbiddenPatterns) {
      if (lowerPassword.includes(pattern.toLowerCase())) {
        errors.push(`Password cannot contain common patterns like "${pattern}"`);
        break;
      }
    }

    // Check for repeated characters (more than 3 in a row)
    if (/(.)\1{3,}/.test(password)) {
      errors.push('Password cannot contain more than 3 consecutive identical characters');
    }

    // Check for sequential characters
    if (this.hasSequentialChars(password)) {
      errors.push('Password cannot contain sequential characters (e.g., 123, abc)');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Password validation failed',
        errors,
      });
    }
  }

  static getPasswordStrength(password: string): {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];

    // Length scoring
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    else if (password.length < 8) feedback.push('Use at least 8 characters');

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    // Complexity bonus
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 1;

    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 1;
    if (this.hasSequentialChars(password)) score -= 1;

    let level: 'weak' | 'fair' | 'good' | 'strong';
    if (score < 3) level = 'weak';
    else if (score < 5) level = 'fair';
    else if (score < 7) level = 'good';
    else level = 'strong';

    return { score: Math.max(0, score), level, feedback };
  }

  private static hasSequentialChars(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      '0123456789',
      'qwertyuiopasdfghjklzxcvbnm',
    ];

    const lowerPassword = password.toLowerCase();

    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 3; i++) {
        const substr = sequence.substring(i, i + 3);
        if (lowerPassword.includes(substr)) return true;

        // Check reverse sequence
        const reverseSubstr = substr.split('').reverse().join('');
        if (lowerPassword.includes(reverseSubstr)) return true;
      }
    }

    return false;
  }
}