<script setup lang="ts">
import { ElMessage } from 'element-plus/es/components/message/index';
import { useRouter } from 'vue-router';
import { useEditorStore } from '@/editor/store/editor.store';
import { useI18n, type Locale } from '@/i18n';
import { downloadJson } from '@/utils/exportJson';

const store = useEditorStore();
const router = useRouter();
const { formatErrorMessage, locale, localeOptions, setLocale, t } = useI18n();

function save() {
  store.saveToLocalStorage();
  if (store.errorMessage) {
    ElMessage.error(formatErrorMessage(store.errorMessage));
  } else {
    ElMessage.success(t('toolbar.saved'));
  }
}

function exportJson() {
  downloadJson(`${store.work.title || 'work'}.json`, store.exportWork());
}

function preview() {
  store.saveToLocalStorage();
  if (store.errorMessage) {
    ElMessage.error(formatErrorMessage(store.errorMessage));
    return;
  }
  router.push('/preview');
}

function run(result: { ok: boolean; message?: string }) {
  if (!result.ok && result.message) ElMessage.warning(formatErrorMessage(result.message));
}

function importJson(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
    const ok = store.importWork(String(reader.result ?? ''));
    if (ok) ElMessage.success(t('toolbar.imported'));
    else ElMessage.error(store.errorMessage ? formatErrorMessage(store.errorMessage) : t('toolbar.importFailed'));
  };
  reader.readAsText(file);
  return false;
}

function changeLocale(value: string) {
  setLocale(value as Locale);
}
</script>

<template>
  <header class="flex h-14 items-center gap-2 border-b border-slate-200 bg-white px-4">
    <strong class="mr-4 text-sm">{{ t('app.name') }}</strong>
    <el-button size="small" type="primary" @click="save">{{ t('toolbar.save') }}</el-button>
    <el-button size="small" :disabled="!store.canUndo" @click="run(store.undo())">{{ t('toolbar.undo') }}</el-button>
    <el-button size="small" :disabled="!store.canRedo" @click="run(store.redo())">{{ t('toolbar.redo') }}</el-button>
    <el-upload :show-file-list="false" accept="application/json,.json" :before-upload="importJson">
      <el-button size="small">{{ t('toolbar.importJson') }}</el-button>
    </el-upload>
    <el-button size="small" @click="exportJson">{{ t('toolbar.exportJson') }}</el-button>
    <el-button size="small" @click="preview">{{ t('toolbar.preview') }}</el-button>
    <el-button size="small" :disabled="!store.canCopy" @click="run(store.copySelectedElement())">{{ t('toolbar.copy') }}</el-button>
    <el-button size="small" :disabled="!store.canPaste" @click="run(store.pasteElement())">{{ t('toolbar.paste') }}</el-button>
    <el-button size="small" type="danger" :disabled="store.selectedElementIds.length === 0" @click="run(store.deleteSelectedElement())">
      {{ t('toolbar.delete') }}
    </el-button>
    <el-dropdown>
      <el-button size="small">{{ t('toolbar.align') }}</el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="run(store.alignSelected('left'))">{{ t('align.left') }}</el-dropdown-item>
          <el-dropdown-item @click="run(store.alignSelected('center'))">{{ t('align.center') }}</el-dropdown-item>
          <el-dropdown-item @click="run(store.alignSelected('right'))">{{ t('align.right') }}</el-dropdown-item>
          <el-dropdown-item @click="run(store.alignSelected('top'))">{{ t('align.top') }}</el-dropdown-item>
          <el-dropdown-item @click="run(store.alignSelected('middle'))">{{ t('align.middle') }}</el-dropdown-item>
          <el-dropdown-item @click="run(store.alignSelected('bottom'))">{{ t('align.bottom') }}</el-dropdown-item>
          <el-dropdown-item @click="run(store.distributeSelected('horizontal'))">{{ t('align.distributeH') }}</el-dropdown-item>
          <el-dropdown-item @click="run(store.distributeSelected('vertical'))">{{ t('align.distributeV') }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-select
      :model-value="locale"
      :aria-label="t('toolbar.language')"
      class="ml-auto w-28"
      size="small"
      @update:model-value="changeLocale"
    >
      <el-option v-for="option in localeOptions" :key="option.value" :label="option.label" :value="option.value" />
    </el-select>
  </header>
</template>
