// stores/accessibility.ts - Store para configurações de acessibilidade
import { defineStore } from 'pinia';

interface AccessibilityState {
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
}

export const useAccessibilityStore = defineStore('accessibility', {
  state: (): AccessibilityState => ({
    fontSize: (localStorage.getItem('accessibility_fontSize') as AccessibilityState['fontSize']) || 'normal',
    highContrast: localStorage.getItem('accessibility_highContrast') === 'true',
    reducedMotion: localStorage.getItem('accessibility_reducedMotion') === 'true',
  }),

  getters: {
    /**
     * Retorna o multiplicador de tamanho da fonte baseado na configuração
     */
    fontSizeMultiplier: (state): number => {
      const multipliers = {
        'small': 0.875,
        'normal': 1,
        'large': 1.125,
        'extra-large': 1.25
      };
      return multipliers[state.fontSize];
    },

    /**
     * Retorna as classes CSS para aplicar as configurações de acessibilidade
     */
    accessibilityClasses: (state): string[] => {
      const classes = [];
      
      if (state.fontSize !== 'normal') {
        classes.push(`font-size-${state.fontSize}`);
      }
      
      if (state.highContrast) {
        classes.push('high-contrast');
      }
      
      if (state.reducedMotion) {
        classes.push('reduced-motion');
      }
      
      return classes;
    },

    /**
     * Retorna as variáveis CSS customizadas para aplicar no documento
     */
    cssVariables: (state) => {
      const multipliers = {
        'small': 0.875,
        'normal': 1,
        'large': 1.125,
        'extra-large': 1.25
      };
      const fontSizeMultiplier = multipliers[state.fontSize];

      return {
        '--accessibility-font-size': `${fontSizeMultiplier}rem`,
        '--accessibility-font-size-small': `${fontSizeMultiplier * 0.875}rem`,
        '--accessibility-font-size-large': `${fontSizeMultiplier * 1.125}rem`,
        '--accessibility-font-size-extra-large': `${fontSizeMultiplier * 1.25}rem`,
      };
    }
  },

  actions: {
    /**
     * Define o tamanho da fonte
     */
    setFontSize(size: AccessibilityState['fontSize']): void {
      this.fontSize = size;
      localStorage.setItem('accessibility_fontSize', size);
      this.applyAccessibilitySettings();
    },

    /**
     * Alterna o modo de alto contraste
     */
    toggleHighContrast(): void {
      this.highContrast = !this.highContrast;
      localStorage.setItem('accessibility_highContrast', this.highContrast.toString());
      this.applyAccessibilitySettings();
    },

    /**
     * Alterna a redução de movimento
     */
    toggleReducedMotion(): void {
      this.reducedMotion = !this.reducedMotion;
      localStorage.setItem('accessibility_reducedMotion', this.reducedMotion.toString());
      this.applyAccessibilitySettings();
    },

    /**
     * Aplica as configurações de acessibilidade ao documento
     */
    applyAccessibilitySettings(): void {
      const root = document.documentElement;
      
      // Aplica variáveis CSS
      const cssVars = this.cssVariables;
      Object.entries(cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // Aplica classes de acessibilidade
      const classes = this.accessibilityClasses;
      
      // Remove classes antigas
      root.classList.remove(
        'font-size-small',
        'font-size-normal', 
        'font-size-large',
        'font-size-extra-large',
        'high-contrast',
        'reduced-motion'
      );
      
      // Adiciona classes novas
      classes.forEach(className => {
        root.classList.add(className);
      });
    },

    /**
     * Inicializa as configurações de acessibilidade
     */
    initialize(): void {
      this.applyAccessibilitySettings();
    },

    /**
     * Reseta todas as configurações para os valores padrão
     */
    reset(): void {
      this.fontSize = 'normal';
      this.highContrast = false;
      this.reducedMotion = false;
      
      localStorage.removeItem('accessibility_fontSize');
      localStorage.removeItem('accessibility_highContrast');
      localStorage.removeItem('accessibility_reducedMotion');
      
      this.applyAccessibilitySettings();
    }
  },
});
