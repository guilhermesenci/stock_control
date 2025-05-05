import { ref, computed, watch } from 'vue';
import type { Ref } from 'vue';

export function useAutocomplete(options: Array<string>) {
  const input: Ref<string> = ref('');
  const show: Ref<boolean> = ref(false);
  const selectedIndex: Ref<number> = ref(-1);

  const filtered = computed<string[]>(() => {
    if (!input.value) return options;
    return options.filter(opt =>
      opt.toLowerCase().includes(input.value.toLowerCase())
    );
  });

  function select(value: string) {
    input.value = value;
    show.value = false;
  }

  function onFocus() {
    show.value = true;
    selectedIndex.value = -1;
  }

  function onBlur() {
    setTimeout(() => (show.value = false), 100);
  }

  function onKeyDown() {
    if (!filtered.value.length) return;
    show.value = true;
    selectedIndex.value =
      (selectedIndex.value + 1) % filtered.value.length;
  }

  function onKeyUp() {
    if (!filtered.value.length) return;
    show.value = true;
    selectedIndex.value =
      selectedIndex.value <= 0
        ? filtered.value.length - 1
        : selectedIndex.value - 1;
  }

  function onKeyEnter() {
    if (
      selectedIndex.value >= 0 &&
      selectedIndex.value < filtered.value.length
    ) {
      select(filtered.value[selectedIndex.value]);
    }
  }

  watch(input, () => {
    selectedIndex.value = -1;
  });

  return {
    input,
    show,
    filtered,
    selectedIndex,
    select,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    onKeyEnter,
  };
}
