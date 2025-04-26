import { BasicColumn } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    dataIndex: 'k1',
    className: 'big-word1',
    width: 300,
  },
  {
    dataIndex: 'v1',
    className: 'big-word',
  },
  {
    dataIndex: 'k2',
    className: 'big-word',
    width: 300,
  },
  {
    dataIndex: 'v2',
    className: 'big-word',
  },
  {
    dataIndex: 'k3',
    className: 'big-word',
    width: 300,
  },
  {
    dataIndex: 'v3',
    className: 'big-word',
  },
];

export const illustrate: BasicColumn[] = [
  {
    className: 'big-word1',
    title: '循泵配位说明',
    children: [
      {
        className: 'big-word',
        title: '双机组运行',
        children: [
          {
            dataIndex: 'v1',
            className: 'big-word',
            title: '循泵配伍',
          },
          {
            dataIndex: 'v2',
            className: 'big-word',
            title: '循泵运行状态',
          },
        ],
      },
      {
        className: 'big-word',
        title: '单机组运行',
        children: [
          {
            dataIndex: 'v3',
            className: 'big-word',
            title: '循泵配伍',
          },
          {
            dataIndex: 'v4',
            className: 'big-word',
            title: '循泵运行状态',
          },
        ],
      },
    ],
  },
];
