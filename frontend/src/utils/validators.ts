export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
};

export type ValidatorFunction<T> = (value: T) => ValidationResult;

export interface ValidationRule<T> {
  validator: ValidatorFunction<T>;
  message: string;
  severity?: 'error' | 'warning';
}

/**
 * Base validator class for chainable validation
 */
export class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  constructor(private value: T) {}

  /**
   * Add a validation rule
   */
  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  /**
   * Add a custom validator function
   */
  custom(validator: ValidatorFunction<T>, message: string, severity: 'error' | 'warning' = 'error'): this {
    return this.addRule({ validator, message, severity });
  }

  /**
   * Validate all rules and return result
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of this.rules) {
      const result = rule.validator(this.value);
      if (!result.isValid) {
        if (rule.severity === 'warning') {
          warnings.push(rule.message);
        } else {
          errors.push(rule.message);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Get the validated value if valid, throw error if invalid
   */
  getValue(): T {
    const result = this.validate();
    if (!result.isValid) {
      throw new Error(`Validation failed: ${result.errors.join(', ')}`);
    }
    return this.value;
  }
}

/**
 * String validator with chainable methods
 */
export class StringValidator extends Validator<string> {
  constructor(value: string) {
    super(value);
  }

  required(message = 'This field is required'): this {
    return this.addRule({
      validator: (value) => ({ isValid: value.trim().length > 0, errors: [] }),
      message,
    });
  }

  minLength(min: number, message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: value.length >= min, errors: [] }),
      message: message || `Must be at least ${min} characters long`,
    });
  }

  maxLength(max: number, message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: value.length <= max, errors: [] }),
      message: message || `Must be no more than ${max} characters long`,
    });
  }

  pattern(regex: RegExp, message = 'Invalid format'): this {
    return this.addRule({
      validator: (value) => ({ isValid: regex.test(value), errors: [] }),
      message,
    });
  }

  email(message = 'Invalid email address'): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.pattern(emailRegex, message);
  }

  url(message = 'Invalid URL'): this {
    return this.addRule({
      validator: (value) => {
        try {
          new URL(value);
          return { isValid: true, errors: [] };
        } catch {
          return { isValid: false, errors: [] };
        }
      },
      message,
    });
  }

  alphanumeric(message = 'Only letters and numbers are allowed'): this {
    return this.pattern(/^[a-zA-Z0-9]+$/, message);
  }

  noSpecialChars(message = 'Special characters are not allowed'): this {
    return this.pattern(/^[a-zA-Z0-9\s]+$/, message);
  }

  strongPassword(message = 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'): this {
    return this.addRule({
      validator: (value) => {
        const hasLength = value.length >= 8;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        return {
          isValid: hasLength && hasUpper && hasLower && hasNumber && hasSpecial,
          errors: [],
        };
      },
      message,
    });
  }

  oneOf(values: string[], message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: values.includes(value), errors: [] }),
      message: message || `Must be one of: ${values.join(', ')}`,
    });
  }
}

/**
 * Number validator with chainable methods
 */
export class NumberValidator extends Validator<number> {
  constructor(value: number) {
    super(value);
  }

  required(message = 'This field is required'): this {
    return this.addRule({
      validator: (value) => ({ isValid: !isNaN(value) && isFinite(value), errors: [] }),
      message,
    });
  }

  min(min: number, message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: value >= min, errors: [] }),
      message: message || `Must be at least ${min}`,
    });
  }

  max(max: number, message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: value <= max, errors: [] }),
      message: message || `Must be no more than ${max}`,
    });
  }

  positive(message = 'Must be a positive number'): this {
    return this.min(0, message);
  }

  integer(message = 'Must be a whole number'): this {
    return this.addRule({
      validator: (value) => ({ isValid: Number.isInteger(value), errors: [] }),
      message,
    });
  }

  between(min: number, max: number, message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: value >= min && value <= max, errors: [] }),
      message: message || `Must be between ${min} and ${max}`,
    });
  }

  multipleOf(factor: number, message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: value % factor === 0, errors: [] }),
      message: message || `Must be a multiple of ${factor}`,
    });
  }
}

/**
 * Array validator with chainable methods
 */
export class ArrayValidator<T> extends Validator<T[]> {
  constructor(value: T[]) {
    super(value);
  }

  required(message = 'This field is required'): this {
    return this.addRule({
      validator: (value) => ({ isValid: Array.isArray(value) && value.length > 0, errors: [] }),
      message,
    });
  }

  minLength(min: number, message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: value.length >= min, errors: [] }),
      message: message || `Must have at least ${min} items`,
    });
  }

  maxLength(max: number, message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: value.length <= max, errors: [] }),
      message: message || `Must have no more than ${max} items`,
    });
  }

  unique(message = 'All items must be unique'): this {
    return this.addRule({
      validator: (value) => {
        const uniqueValues = new Set(value);
        return { isValid: uniqueValues.size === value.length, errors: [] };
      },
      message,
    });
  }

  each(itemValidator: (item: T) => ValidationResult, message = 'One or more items are invalid'): this {
    return this.addRule({
      validator: (value) => {
        const allValid = value.every(item => itemValidator(item).isValid);
        return { isValid: allValid, errors: [] };
      },
      message,
    });
  }
}

/**
 * Object validator with chainable methods
 */
export class ObjectValidator<T extends Record<string, any>> extends Validator<T> {
  constructor(value: T) {
    super(value);
  }

  required(message = 'This field is required'): this {
    return this.addRule({
      validator: (value) => ({ isValid: value !== null && value !== undefined, errors: [] }),
      message,
    });
  }

  hasProperty(property: keyof T, message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: property in value, errors: [] }),
      message: message || `Property '${String(property)}' is required`,
    });
  }

  validateProperty<K extends keyof T>(
    property: K,
    validator: (value: T[K]) => ValidationResult,
    message?: string
  ): this {
    return this.addRule({
      validator: (value) => {
        if (!(property in value)) {
          return { isValid: false, errors: [] };
        }
        return validator(value[property]);
      },
      message: message || `Property '${String(property)}' is invalid`,
    });
  }
}

/**
 * File validator with chainable methods
 */
export class FileValidator extends Validator<File> {
  constructor(value: File) {
    super(value);
  }

  required(message = 'File is required'): this {
    return this.addRule({
      validator: (value) => ({ isValid: value instanceof File, errors: [] }),
      message,
    });
  }

  maxSize(maxBytes: number, message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: value.size <= maxBytes, errors: [] }),
      message: message || `File size must be less than ${this.formatBytes(maxBytes)}`,
    });
  }

  mimeType(allowedTypes: string[], message?: string): this {
    return this.addRule({
      validator: (value) => ({ isValid: allowedTypes.includes(value.type), errors: [] }),
      message: message || `File type must be one of: ${allowedTypes.join(', ')}`,
    });
  }

  extension(allowedExtensions: string[], message?: string): this {
    return this.addRule({
      validator: (value) => {
        const extension = value.name.split('.').pop()?.toLowerCase() || '';
        return { isValid: allowedExtensions.includes(extension), errors: [] };
      },
      message: message || `File extension must be one of: ${allowedExtensions.join(', ')}`,
    });
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Factory functions for creating validators
 */
export const validate = {
  string: (value: string) => new StringValidator(value),
  number: (value: number) => new NumberValidator(value),
  array: <T>(value: T[]) => new ArrayValidator(value),
  object: <T extends Record<string, any>>(value: T) => new ObjectValidator(value),
  file: (value: File) => new FileValidator(value),
};

/**
 * Common validation functions
 */
export const validators = {
  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(value),
      errors: emailRegex.test(value) ? [] : ['Invalid email address'],
    };
  },

  phone: (value: string): ValidationResult => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    const isValid = phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    return {
      isValid,
      errors: isValid ? [] : ['Invalid phone number'],
    };
  },

  creditCard: (value: string): ValidationResult => {
    const cleaned = value.replace(/\D/g, '');
    const isValid = /^\d{13,19}$/.test(cleaned) && luhnCheck(cleaned);
    return {
      isValid,
      errors: isValid ? [] : ['Invalid credit card number'],
    };
  },

  ssn: (value: string): ValidationResult => {
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
    return {
      isValid: ssnRegex.test(value),
      errors: ssnRegex.test(value) ? [] : ['Invalid SSN format'],
    };
  },

  zipCode: (value: string): ValidationResult => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return {
      isValid: zipRegex.test(value),
      errors: zipRegex.test(value) ? [] : ['Invalid ZIP code'],
    };
  },

  currency: (value: string): ValidationResult => {
    const currencyRegex = /^\$?\d+(\.\d{2})?$/;
    return {
      isValid: currencyRegex.test(value),
      errors: currencyRegex.test(value) ? [] : ['Invalid currency format'],
    };
  },
};

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate form data with schema
 */
export interface ValidationSchema {
  [key: string]: ValidatorFunction<any>;
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    const result = validator(data[field]);
    if (!result.isValid) {
      errors.push(...result.errors.map(error => `${field}: ${error}`));
    }
    if (result.warnings) {
      warnings.push(...result.warnings.map(warning => `${field}: ${warning}`));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Async validator for server-side validation
 */
export class AsyncValidator<T> {
  constructor(private value: T) {}

  async validate(validator: (value: T) => Promise<ValidationResult>): Promise<ValidationResult> {
    try {
      return await validator(this.value);
    } catch (error) {
      return {
        isValid: false,
        errors: ['Validation error occurred'],
      };
    }
  }
}

export const asyncValidate = <T>(value: T) => new AsyncValidator(value);
 
