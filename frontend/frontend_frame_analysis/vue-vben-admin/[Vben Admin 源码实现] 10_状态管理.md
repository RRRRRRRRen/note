# 前言



# 状态管理器注册

`main.ts`中有关router的执行代码

```ts
import { setupStore } from '@/store';

// ...
async function bootstrap() {
  // 挂载状态管理器
  setupStore(app);
}
```

## 注册状态管理器

```ts
import type { App } from 'vue';
import { createPinia } from 'pinia';

const store = createPinia();

export function setupStore(app: App<Element>) {
  app.use(store);
}

export { store };
```

