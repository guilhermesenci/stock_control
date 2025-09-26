// composables/useAccessibility.ts - Composable para funcionalidades de acessibilidade
import { computed } from 'vue';
import { useAccessibilityStore } from '@/stores/accessibility';

export function useAccessibility() {
  const accessibilityStore = useAccessibilityStore();

  // Getters reativos
  const fontSize = computed(() => accessibilityStore.fontSize);
  const highContrast = computed(() => accessibilityStore.highContrast);
  const reducedMotion = computed(() => accessibilityStore.reducedMotion);
  const fontSizeMultiplier = computed(() => accessibilityStore.fontSizeMultiplier);
  const accessibilityClasses = computed(() => accessibilityStore.accessibilityClasses);

  // Opções de tamanho de fonte
  const fontSizeOptions = [
    { value: 'small', label: 'Pequeno', description: '87.5% do tamanho normal' },
    { value: 'normal', label: 'Normal', description: 'Tamanho padrão' },
    { value: 'large', label: 'Grande', description: '112.5% do tamanho normal' },
    { value: 'extra-large', label: 'Extra Grande', description: '125% do tamanho normal' }
  ] as const;

  // Funções de ação
  const setFontSize = (size: typeof fontSizeOptions[number]['value']) => {
    accessibilityStore.setFontSize(size);
  };

  const toggleHighContrast = () => {
    accessibilityStore.toggleHighContrast();
  };

  const toggleReducedMotion = () => {
    accessibilityStore.toggleReducedMotion();
  };

  const resetSettings = () => {
    accessibilityStore.reset();
  };

  const initialize = () => {
    accessibilityStore.initialize();
  };

  // Função para obter o tamanho da fonte atual em pixels
  const getCurrentFontSize = (baseSize: number = 16): number => {
    return baseSize * fontSizeMultiplier.value;
  };

  // Função para verificar se uma configuração específica está ativa
  const isFontSize = (size: typeof fontSizeOptions[number]['value']): boolean => {
    return fontSize.value === size;
  };

  // Função para obter classes CSS condicionais
  const getConditionalClasses = (baseClasses: string = ''): string => {
    const classes = [baseClasses, ...accessibilityClasses.value].filter(Boolean);
    return classes.join(' ');
  };

  return {
    // Estado reativo
    fontSize,
    highContrast,
    reducedMotion,
    fontSizeMultiplier,
    accessibilityClasses,
    
    // Opções
    fontSizeOptions,
    
    // Ações
    setFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    resetSettings,
    initialize,
    
    // Utilitários
    getCurrentFontSize,
    isFontSize,
    getConditionalClasses,
  };
}
