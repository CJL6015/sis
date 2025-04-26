import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const model: AppRouteModule = {
  path: '/sis',
  name: '丰城SIS',
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
        // affix: true,
        title: '主界面',
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
      path: 'optimize',
      name: 'optimize',
      component: () => import('/@/views/sis/optimize/index.vue'),
      meta: {
        title: '循泵优化节支查询',
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
  ],
};

export default model;
