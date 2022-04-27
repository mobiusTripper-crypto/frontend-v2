import { ref } from 'vue';

export default function usePromiseSequence() {
  const promises = ref<Array<() => Promise<void>>>([]);
  const processing = ref(false);

  async function processAll(): Promise<void> {
    processing.value = true;
    while (promises.value.length > 0) {
      await promises.value[0]();
      promises.value.pop();
    }
    processing.value = false;
  }

  return {
    promises,
    processing,
    processAll
  };
}
