<!-- BaseTable.vue -->
  <template>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key as string"
              @click="col.sortable && handleSort(col.key as string)"
              :class="{ sortable: col.sortable, active: sortKey === col.key }"
            >
              {{ col.label }}
              <span v-if="col.sortable">{{ sortIcon(col) }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="String(row[keyField])">
            <td v-for="col in columns" :key="col.key as string">
              <slot :name="`cell-${col.key as string}`" :value="row[col.key]" :row="row">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  import type { ColumnDef } from '@/composables/useTable';
  
  interface Props<T> {
    columns: ColumnDef<T>[];
    rows: T[];
    sortKey: keyof T | null;
    sortOrder: 'asc' | 'desc';
    keyField: keyof T;
  }
  
  const props = defineProps<Props<any>>();
  const emit = defineEmits<{ (e: 'update:sort', key: string): void }>();
  
  function handleSort(key: string) {
    emit('update:sort', key);
  }
  
  function sortIcon<T>(col: ColumnDef<T>) {
    if (props.sortKey !== col.key) return '⇅';
    return props.sortOrder === 'asc' ? '⬆' : '⬇';
  }
  </script>
  