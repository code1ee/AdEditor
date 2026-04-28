<script setup lang="ts">
import { useI18n } from '@/i18n';

const model = defineModel<Record<string, unknown>>({ required: true });
const { t } = useI18n();
</script>

<template>
  <el-form-item :label="t('properties.text')">
    <el-input
      :model-value="String(model.text ?? '')"
      type="textarea"
      :rows="3"
      @update:model-value="model = { ...model, text: $event }"
    />
  </el-form-item>
</template>
