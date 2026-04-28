<script setup lang="ts">
import { useI18n } from '@/i18n';

const model = defineModel<Record<string, unknown>>({ required: true });
const { t } = useI18n();
</script>

<template>
  <el-form-item :label="t('properties.imageUrl')">
    <el-input
      :model-value="String(model.src ?? '')"
      placeholder="https://example.com/image.jpg"
      @update:model-value="model = { ...model, src: $event }"
    />
  </el-form-item>
  <el-form-item :label="t('properties.alt')">
    <el-input
      :model-value="String(model.alt ?? '')"
      @update:model-value="model = { ...model, alt: $event }"
    />
  </el-form-item>
</template>
