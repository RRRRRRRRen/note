# 前言

路由配置大纲



# 路由注册

`main.ts`中有关router的执行代码

```ts
import { router, setupRouter } from '@/router';
import { setupRouterGuard } from '@/router/guard';

// ...
async function bootstrap() {
  // Configure routing
  // 配置路由
  setupRouter(app);

  // router-guard
  // 路由守卫
  setupRouterGuard(router);
}
```

## 注册路由`setupRouter`

来源：`src/router/index.ts`

代码：

```ts
import type { App } from 'vue';
// config router
// 配置路由器
export function setupRouter(app: App<Element>) {
  app.use(router);
}
```

分析：

`app.use(router)`就是vue标准的插件注册函数，将vue-router实例注册在vue应用上。

TS：

`app: App<Element>`就是直接抄录vue-app实例的类型，我们在使用vue中createApp函数创建vue实例时，得到的实例就是`App<Element>`类型。



## 路由实例`router`

代码：

```ts
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHashHistory } from 'vue-router';

// app router
// 创建一个可以被 Vue 应用程序使用的路由实例
export const router = createRouter({
  // 创建一个 hash 历史记录。
  history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH),
  // 应该添加到路由的初始路由列表。
  routes: basicRoutes as unknown as RouteRecordRaw[],
  // 是否应该禁止尾部斜杠。默认为假
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});
```

分析：

createRouter用于创建router实例

​	history

​	接受一个路由类型，分为两种，一种hash模式（createWebHashHistory），一种是history模式（createWebHistory）。其中hash模式不需要服务器配置简单易用，history需要服务器的配置使用。具有巨大的观感差距

```js
// history模式
http://192.168.3.47:5173/main-out
// hash模式
http://192.168.3.47:5173/#/main-out
```

createWebHashHistory接受一个基础路径作为参数，用来重制web应用跟路径

```ts
// 基于 https://example.com/folder
createWebHashHistory() // 给出一个 `https://example.com/folder#` 的 URL
createWebHashHistory('/folder/') // 给出一个 `https://example.com/folder/#` 的 URL
// 如果其基础位置提供了 `#`，则不会被 `createWebHashHistory` 添加
createWebHashHistory('/folder/#/app/') // 给出一个 `https://example.com/folder/#/app/` 的 URL
```

​	routes

​	接受一个基础的路由列表。

​	scrollBehavior

​	控制切换路由后页面滚动的行为。

TS：

​	`as unknown as RouteRecordRaw[]`将basicRoutes断言伪RouteRecordRaw[]，为什么使用`as unknow as`参考文章：[Typescript: Why does `as unknown as x` work - Stack Overflow](https://stackoverflow.com/questions/69399211/typescript-why-does-as-unknown-as-x-work)



## 初始路由`basicRoutes`

来源：`src/router/routes/index.ts`

代码：

```ts
import type { AppRouteRecordRaw, AppRouteModule } from '/@/router/types';

import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '/@/router/routes/basic';
import { mainOutRoutes } from './mainOut';

// 根路由
export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
};

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('/@/views/sys/login/Login.vue'),
  meta: {
    // 国际化
    title: t('routes.basic.login'),
  },
};

export const basicRoutes = [
  LoginRoute,
  RootRoute,
  ...mainOutRoutes,
  REDIRECT_ROUTE,
  PAGE_NOT_FOUND_ROUTE,
];
```

分析：

LoginRoute登录路由

RootRoute根路由需要重定向到默认主页

REDIRECT_ROUTE重定向处理路由

PAGE_NOT_FOUND_ROUTE错误处理路由

mainOutRoutes自定义的layout外的界面路由



# 路由守卫

回到main.ts中的`import { setupRouterGuard } from '@/router/guard';`

setupRouterGuard用于注册路由守卫

来源：`src/router/guard/index.ts`

代码：

```ts
export function setupRouterGuard(router: Router) {
  // 创建页面守卫，用于处理页面级别的导航守卫逻辑。
  createPageGuard(router);
  // 创建页面加载守卫，用于处理页面加载过程中的逻辑，例如显示加载动画。
  createPageLoadingGuard(router);
  // 创建 HTTP 守卫，用于处理与后端 API 交互时的逻辑。
  createHttpGuard(router);
  // 创建滚动守卫，用于处理页面滚动行为的逻辑。
  createScrollGuard(router);
  // 创建消息守卫，用于处理消息通知的逻辑。
  createMessageGuard(router);
  // 创建进度守卫，用于处理页面加载进度的逻辑。
  createProgressGuard(router);
  // 创建权限守卫，用于处理页面权限控制的逻辑。
  createPermissionGuard(router);
  // 创建参数菜单守卫，必须在创建权限守卫之后执行（菜单已构建）。
  createParamMenuGuard(router); // must after createPermissionGuard (menu has been built.)
  // 创建状态守卫，用于处理应用状态的逻辑。
  createStateGuard(router);
}
```

分析：

通过调用这些函数来设置路由守卫，可以在特定的路由导航事件发生时执行相应的逻辑，例如在页面跳转前后执行一些操作，控制页面的加载行为，处理与后端的数据交互，管理页面滚动等。

这种方式可以将不同类型的路由守卫逻辑拆分为独立的函数，使代码结构更清晰，并且可以根据需要选择性地调用不同的守卫函数来实现特定的功能。



# 异步路由

```ts
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      const { t } = useI18n();
      const userStore = useUserStore();
      const appStore = useAppStoreWithOut();

      let routes: AppRouteRecordRaw[] = [];
      const roleList = toRaw(userStore.getRoleList) || [];
      const { permissionMode = projectSetting.permissionMode } = appStore.getProjectConfig;

      // 路由过滤器 在 函数filter 作为回调传入遍历使用
      const routeFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // 抽出角色
        const { roles } = meta || {};
        if (!roles) return true;
        // 进行角色权限判断
        return roleList.some((role) => roles.includes(role));
      };

      const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        // ignoreRoute 为true 则路由仅用于菜单生成，不会在实际的路由表中出现
        const { ignoreRoute } = meta || {};
        // arr.filter 返回 true 表示该元素通过测试
        return !ignoreRoute;
      };

      /**
       * @description 根据设置的首页path，修正routes中的affix标记（固定首页）
       * */
      const patchHomeAffix = (routes: AppRouteRecordRaw[]) => {
        if (!routes || routes.length === 0) return;
        let homePath: string = userStore.getUserInfo.homePath || PageEnum.BASE_HOME;

        function patcher(routes: AppRouteRecordRaw[], parentPath = '') {
          if (parentPath) parentPath = parentPath + '/';
          routes.forEach((route: AppRouteRecordRaw) => {
            const { path, children, redirect } = route;
            const currentPath = path.startsWith('/') ? path : parentPath + path;
            if (currentPath === homePath) {
              if (redirect) {
                homePath = route.redirect! as string;
              } else {
                route.meta = Object.assign({}, route.meta, { affix: true });
                throw new Error('end');
              }
            }
            children && children.length > 0 && patcher(children, currentPath);
          });
        }

        try {
          patcher(routes);
        } catch (e) {
          // 已处理完毕跳出循环
        }
        return;
      };

      switch (permissionMode) {
        // 角色权限
        case PermissionModeEnum.ROLE:
          // 对非一级路由进行过滤
          routes = filter(asyncRoutes, routeFilter);
          // 对一级路由根据角色权限过滤
          routes = routes.filter(routeFilter);
          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        // 路由映射， 默认进入该case
        case PermissionModeEnum.ROUTE_MAPPING:
          // 对非一级路由进行过滤
          routes = filter(asyncRoutes, routeFilter);
          // 对一级路由再次根据角色权限过滤
          routes = routes.filter(routeFilter);
          // 将路由转换成菜单
          const menuList = transformRouteToMenu(routes, true);
          // 移除掉 ignoreRoute: true 的路由 非一级路由
          routes = filter(routes, routeRemoveIgnoreFilter);
          // 移除掉 ignoreRoute: true 的路由 一级路由；
          routes = routes.filter(routeRemoveIgnoreFilter);
          // 对菜单进行排序
          menuList.sort((a, b) => {
            return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
          });

          // 设置菜单列表
          this.setFrontMenuList(menuList);

          // Convert multi-level routing to level 2 routing
          // 将多级路由转换为 2 级路由
          routes = flatMultiLevelRoutes(routes);
          break;

        //  If you are sure that you do not need to do background dynamic permissions, please comment the entire judgment below
        //  如果确定不需要做后台动态权限，请在下方注释整个判断
        case PermissionModeEnum.BACK:
          const { createMessage } = useMessage();

          createMessage.loading({
            content: t('sys.app.menuLoading'),
            duration: 1,
          });

          // !Simulate to obtain permission codes from the background,
          // 模拟从后台获取权限码，
          // this function may only need to be executed once, and the actual project can be put at the right time by itself
          // 这个功能可能只需要执行一次，实际项目可以自己放在合适的时间
          let routeList: AppRouteRecordRaw[] = [];
          try {
            await this.changePermissionCode();
            routeList = (await getMenuList()) as AppRouteRecordRaw[];
          } catch (error) {
            console.error(error);
          }

          // Dynamically introduce components
          // 动态引入组件
          routeList = transformObjToRoute(routeList);

          //  Background routing to menu structure
          //  后台路由到菜单结构
          const backMenuList = transformRouteToMenu(routeList);
          this.setBackMenuList(backMenuList);

          // remove meta.ignoreRoute item
          // 删除 meta.ignoreRoute 项
          routeList = filter(routeList, routeRemoveIgnoreFilter);
          routeList = routeList.filter(routeRemoveIgnoreFilter);

          routeList = flatMultiLevelRoutes(routeList);
          routes = [PAGE_NOT_FOUND_ROUTE, ...routeList];
          break;
      }

      routes.push(ERROR_LOG_ROUTE);
      patchHomeAffix(routes);
      return routes;
    },
```

