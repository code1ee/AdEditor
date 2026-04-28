import 'element-plus/dist/index.css';
import '@/styles/index.css';

import { ElButton } from 'element-plus/es/components/button/index';
import { ElForm, ElFormItem } from 'element-plus/es/components/form/index';
import { ElInput } from 'element-plus/es/components/input/index';
import { ElInputNumber } from 'element-plus/es/components/input-number/index';
import { ElOption, ElSelect } from 'element-plus/es/components/select/index';
import { ElUpload } from 'element-plus/es/components/upload/index';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';

createApp(App)
  .use(createPinia())
  .use(router)
  .use(ElButton)
  .use(ElForm)
  .use(ElFormItem)
  .use(ElInput)
  .use(ElInputNumber)
  .use(ElOption)
  .use(ElSelect)
  .use(ElUpload)
  .mount('#app');
