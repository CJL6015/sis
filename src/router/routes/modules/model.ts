import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const model: AppRouteModule = {
  path: '/sis',
  name: 'SIS',
  component: LAYOUT,
  redirect: '/sis/main',
  meta: {
    orderNo: 10,
    icon: 'ion:grid-outline',
    title: '智能sis',
  },
  children: [
    {
      path: 'main',
      name: 'main',
      component: () => import('/@/views/sis/main/index.vue'),
      meta: {
        title: '主界面',
      },
    },
    {
      path: 'main2',
      name: 'main2',
      component: () => import('/@/views/sis/main2/index.vue'),
      meta: {
        title: '循环水系统优化概览',
      },
    },
    {
      path: 'optimize',
      name: 'optimize',
      component: () => import('/@/views/sis/optimize/index.vue'),
      meta: {
        title: '实时循泵优化节支计算',
      },
    },
    {
      path: 'load',
      name: 'load',
      component: () => import('/@/views/sis/load/index.vue'),
      meta: {
        title: '规划负荷循泵优化节支计算',
      },
    },
    {
      path: 'future',
      name: 'future',
      component: () => import('/@/views/sis/future/index.vue'),
      meta: {
        title: '未来96点循泵优化节支计算',
      },
    },
    {
      path: 'param',
      name: 'param',
      component: () => import('/@/views/sis/param/index.vue'),
      meta: {
        // affix: true,
        title: '热力参数汇总',
      },
    },
    {
      path: 'history',
      name: 'history',
      component: () => import('/@/views/sis/history/index.vue'),
      meta: {
        title: '历史参数查询',
      },
    },
    {
      path: 'system',
      name: 'system',
      component: () => import('/@/views/sis/system/index.vue'),
      meta: {
        title: '冷端系统特性查询',
      },
    },
    {
      path: 'calculate',
      name: 'calculate',
      component: () => import('/@/views/sis/calculate/index.vue'),
      meta: {
        title: '调门实时计算',
      },
    },
  ],
};

export default model;
