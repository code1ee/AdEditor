<script setup lang="ts">
import { computed } from 'vue';
import { pluginRegistry } from '@/plugins';
import { useEditorStore } from '@/editor/store/editor.store';
import { useI18n } from '@/i18n';

const store = useEditorStore();
const { t } = useI18n();
const selected = computed(() => store.selectedElement);
const selectedPlugin = computed(() => (selected.value ? pluginRegistry.get(selected.value.type) : undefined));

function updateStyle(field: string, value: number) {
  if (!selected.value) return;
  store.updateElementStyle(selected.value.id, { [field]: value });
}

function updateProps(value: Record<string, unknown>) {
  if (!selected.value) return;
  store.updateElementProps(selected.value.id, value);
}
</script>

<template>
  <section>
    <h2 class="mb-3 text-sm font-semibold">{{ t('properties.element') }}</h2>
    <p v-if="!selected" class="rounded bg-slate-50 p-3 text-sm text-slate-500">{{ t('properties.empty') }}</p>
    <el-form v-else label-position="top" size="small">
      <div class="grid grid-cols-2 gap-2">
        <el-form-item :label="t('properties.x')">
          <el-input-number :model-value="selected.style.x" @update:model-value="updateStyle('x', Number($event))" />
        </el-form-item>
        <el-form-item :label="t('properties.y')">
          <el-input-number :model-value="selected.style.y" @update:model-value="updateStyle('y', Number($event))" />
        </el-form-item>
        <el-form-item :label="t('properties.width')">
          <el-input-number :model-value="selected.style.width" :min="1" @update:model-value="updateStyle('width', Number($event))" />
        </el-form-item>
        <el-form-item :label="t('properties.height')">
          <el-input-number :model-value="selected.style.height" :min="1" @update:model-value="updateStyle('height', Number($event))" />
        </el-form-item>
        <el-form-item :label="t('properties.zIndex')">
          <el-input-number :model-value="selected.style.zIndex" @update:model-value="updateStyle('zIndex', Number($event))" />
        </el-form-item>
        <el-form-item :label="t('properties.opacity')">
          <el-input-number :model-value="selected.style.opacity ?? 1" :min="0" :max="1" :step="0.1" @update:model-value="updateStyle('opacity', Number($event))" />
        </el-form-item>
      </div>

      <component
        :is="selectedPlugin.propertyEditor"
        v-if="selectedPlugin?.propertyEditor"
        :model-value="selected.props"
        @update:model-value="updateProps"
      />
    </el-form>
  </section>
</template>
