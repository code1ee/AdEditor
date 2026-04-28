<script setup lang="ts">
import { useI18n } from '@/i18n';

const model = defineModel<Record<string, unknown>>({ required: true });
const { t } = useI18n();
</script>

<template>
  <el-form-item :label="t('properties.buttonText')">
    <el-input
      :model-value="String(model.text ?? '')"
      @update:model-value="model = { ...model, text: $event }"
    />
  </el-form-item>
</template>
