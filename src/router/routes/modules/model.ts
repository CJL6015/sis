import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';

const model: AppRouteModule[] = [
  {
    path: '/sis',
    name: 'SIS',
    component: LAYOUT,
    redirect: '/sis/main',
    meta: {
      orderNo: 10,
      icon: 'ion:grid-outline',
      title: '冷端监测与优化',
    },
    children: [
      {
        path: 'main',
        name: 'main',
        component: () => import('/@/views/sis/main/index.vue'),
        meta: {
          title: '主要信息一览',
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
        component: LAYOUT,
        meta: {
          title: '实时循泵优化节支计算',
        },
        children: [
          {
            path: 'overview',
            name: 'overview',
            component: () => import('/@/views/sis/overview/index.vue'),
            meta: {
              title: '概览',
            },
          },
          {
            path: 'calculation',
            name: 'calculation',
            component: () => import('/@/views/sis/optimize/index.vue'),
            meta: {
              title: '节支计算',
            },
          },
        ],
      },
      {
        path: 'cal',
        name: 'cal',
        meta: {
          title: '规划循泵优化计算',
        },
        children: [
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
        ],
      },
      {
        path: 'basic-dignosis',
        name: 'basic-dignosis',
        component: LAYOUT,
        meta: {
          title: '双机互查基础诊断',
        },
        children: [
          {
            path: 'sub1',
            name: 'sub1',
            component: () => import('/@/views/sis/diagnosis/sub1/index.vue'),
            meta: {
              title: '子页面1',
            },
          },
          {
            path: 'sub2',
            name: 'sub2',
            component: () => import('/@/views/sis/diagnosis/sub2/index.vue'),
            meta: {
              title: '子页面2',
            },
          },
        ],
      },
      {
        path: 'clean',
        name: 'clean',
        component: LAYOUT,
        meta: {
          title: '水侧脏污与胶球清洗',
        },
        children: [
          {
            path: 'clean-unit1',
            name: 'clean-unit1',
            component: () => import('/@/views/sis/draw/unit1/index.vue'),
            meta: {
              title: '#1机组',
            },
          },
          {
            path: 'clean-unit2',
            name: 'clean-unit2',
            component: () => import('/@/views/sis/draw/unit2/index.vue'),
            meta: {
              title: '#2机组',
            },
          },
        ],
      },
      {
        path: 'gas-diagnosis',
        name: 'gas-diagnosis',
        component: () => import('/@/views/sis/gas/index.vue'),
        meta: {
          title: '汽侧不凝气体诊断',
        },
      },
      {
        path: 'tightness',
        name: 'tightness',
        component: LAYOUT,
        meta: {
          title: '真空严密性试验',
        },
        children: [
          {
            path: 'test1',
            name: 'test1',
            component: () => import('/@/views/sis/test/test1/index.vue'),
            meta: {
              title: '#1机组',
            },
          },
          {
            path: 'test2',
            name: 'test2',
            component: () => import('/@/views/sis/test/test2/index.vue'),
            meta: {
              title: '#2机组',
            },
          },
        ],
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
    ],
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: LAYOUT,
    redirect: '/monitor/calculate/cal1',
    meta: {
      orderNo: 20,
      icon: 'ion:grid-outline',
      title: '调门在线监测',
    },
    children: [
      {
        path: 'calculate',
        name: 'calculate',
        component: LAYOUT,
        meta: {
          title: '实时调门计算',
        },
        children: [
          {
            path: 'cal1',
            name: 'cal1',
            component: () => import('/@/views/sis/calculate/cal1/index.vue'),
            meta: {
              title: '#1机组',
            },
          },
          {
            path: 'cal2',
            name: 'cal2',
            component: () => import('/@/views/sis/calculate/cal2/index.vue'),
            meta: {
              title: '#2机组',
            },
          },
        ],
      },
      {
        path: 'index',
        name: 'MonitorIndex',
        component: LAYOUT,
        meta: {
          title: '调门状态检测',
        },
        children: [
          {
            path: 'unit1',
            name: 'unit1',
            component: () => import('/@/views/sis/gate/gate1/index.vue'),
            meta: {
              title: '#1机组',
            },
          },
          {
            path: 'unit2',
            name: 'unit2',
            component: () => import('/@/views/sis/gate/gate2/index.vue'),
            meta: {
              title: '#2机组',
            },
          },
        ],
      },
    ],
  },
];

export default model;
