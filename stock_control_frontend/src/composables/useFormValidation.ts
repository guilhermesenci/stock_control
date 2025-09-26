// src/composables/useFormValidation.ts
import { ref, computed, reactive } from 'vue';

export interface ValidationRule {
  (value: any): string | boolean;
}

export interface FieldValidation {
  value: any;
  error: string;
  touched: boolean;
  rules: ValidationRule[];
}

export interface FormValidation {
  fields: Record<string, FieldValidation>;
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Composable para validação de formulários
 */
export function useFormValidation(initialFields: Record<string, any> = {}) {
  const fields = reactive<Record<string, FieldValidation>>({});
  const formTouched = ref(false);

  // Inicializa os campos
  Object.keys(initialFields).forEach(key => {
    fields[key] = {
      value: initialFields[key],
      error: '',
      touched: false,
      rules: [],
    };
  });

  // Computed properties
  const errors = computed(() => {
    const result: Record<string, string> = {};
    Object.keys(fields).forEach(key => {
      if (fields[key].error) {
        result[key] = fields[key].error;
      }
    });
    return result;
  });

  const isValid = computed(() => {
    return Object.values(fields).every(field => !field.error);
  });

  const hasErrors = computed(() => {
    return Object.values(fields).some(field => field.error);
  });

  // Métodos
  const setFieldValue = (fieldName: string, value: any) => {
    if (fields[fieldName]) {
      fields[fieldName].value = value;
      if (fields[fieldName].touched) {
        validateField(fieldName);
      }
    }
  };

  const setFieldRules = (fieldName: string, rules: ValidationRule[]) => {
    if (fields[fieldName]) {
      fields[fieldName].rules = rules;
    }
  };

  const validateField = (fieldName: string): boolean => {
    const field = fields[fieldName];
    if (!field || !field.rules.length) return true;

    for (const rule of field.rules) {
      const result = rule(field.value);
      if (typeof result === 'string') {
        field.error = result;
        return false;
      } else if (result === false) {
        field.error = 'Valor inválido';
        return false;
      }
    }

    field.error = '';
    return true;
  };

  const touchField = (fieldName: string) => {
    if (fields[fieldName]) {
      fields[fieldName].touched = true;
      validateField(fieldName);
    }
  };

  const touchAllFields = () => {
    formTouched.value = true;
    Object.keys(fields).forEach(key => {
      fields[key].touched = true;
      validateField(key);
    });
  };

  const validateForm = (): boolean => {
    touchAllFields();
    return isValid.value;
  };

  const clearErrors = () => {
    Object.keys(fields).forEach(key => {
      fields[key].error = '';
      fields[key].touched = false;
    });
    formTouched.value = false;
  };

  const resetForm = () => {
    Object.keys(fields).forEach(key => {
      fields[key].value = initialFields[key] || '';
      fields[key].error = '';
      fields[key].touched = false;
    });
    formTouched.value = false;
  };

  const getFieldValue = (fieldName: string) => {
    return fields[fieldName]?.value;
  };

  const getFormData = () => {
    const data: Record<string, any> = {};
    Object.keys(fields).forEach(key => {
      data[key] = fields[key].value;
    });
    return data;
  };

  return {
    fields,
    errors,
    isValid,
    hasErrors,
    formTouched,
    setFieldValue,
    setFieldRules,
    validateField,
    touchField,
    touchAllFields,
    validateForm,
    clearErrors,
    resetForm,
    getFieldValue,
    getFormData,
  };
}

// Regras de validação comuns
export const validationRules = {
  required: (message = 'Este campo é obrigatório'): ValidationRule => 
    (value) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      return true;
    },

  minLength: (min: number, message?: string): ValidationRule => 
    (value) => {
      if (typeof value === 'string' && value.length < min) {
        return message || `Deve ter pelo menos ${min} caracteres`;
      }
      return true;
    },

  maxLength: (max: number, message?: string): ValidationRule => 
    (value) => {
      if (typeof value === 'string' && value.length > max) {
        return message || `Deve ter no máximo ${max} caracteres`;
      }
      return true;
    },

  email: (message = 'Email inválido'): ValidationRule => 
    (value) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return message;
      }
      return true;
    },

  min: (min: number, message?: string): ValidationRule => 
    (value) => {
      const num = Number(value);
      if (!isNaN(num) && num < min) {
        return message || `Deve ser maior ou igual a ${min}`;
      }
      return true;
    },

  max: (max: number, message?: string): ValidationRule => 
    (value) => {
      const num = Number(value);
      if (!isNaN(num) && num > max) {
        return message || `Deve ser menor ou igual a ${max}`;
      }
      return true;
    },

  positive: (message = 'Deve ser um número positivo'): ValidationRule => 
    (value) => {
      const num = Number(value);
      if (!isNaN(num) && num <= 0) {
        return message;
      }
      return true;
    },

  integer: (message = 'Deve ser um número inteiro'): ValidationRule => 
    (value) => {
      const num = Number(value);
      if (!isNaN(num) && !Number.isInteger(num)) {
        return message;
      }
      return true;
    },

  pattern: (regex: RegExp, message = 'Formato inválido'): ValidationRule => 
    (value) => {
      if (value && !regex.test(value)) {
        return message;
      }
      return true;
    },

  custom: (validator: (value: any) => string | boolean): ValidationRule => 
    validator,
};
