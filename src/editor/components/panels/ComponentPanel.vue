<script setup lang="ts">
import { pluginRegistry } from '@/plugins';
import { useEditorStore } from '@/editor/store/editor.store';
import { useI18n } from '@/i18n';

const store = useEditorStore();
const { t } = useI18n();
const plugins = pluginRegistry.list();

function getPluginTitle(type: string): string {
  if (type === 'text') return t('components.text');
  if (type === 'image') return t('components.image');
  if (type === 'button') return t('components.button');
  return type;
}
</script>

<template>
  <section>
    <h2 class="mb-3 text-sm font-semibold">{{ t('components.title') }}</h2>
    <div class="space-y-2">
      <button
        v-for="plugin in plugins"
        :key="plugin.type"
        class="flex w-full items-center gap-2 rounded border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
        type="button"
        @click="store.addElement(plugin.type)"
      >
        <span class="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-semibold">
          {{ plugin.icon }}
        </span>
        {{ getPluginTitle(plugin.type) }}
      </button>
    </div>
  </section>
</template>
