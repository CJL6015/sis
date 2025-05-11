import { BasicColumn } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    dataIndex: 'name',
    className: 'big-word',
  },
  {
    dataIndex: 'now',
    className: 'big-word',
    title: '当前状态',
  },
  {
    dataIndex: 'optimize',
    className: 'big-word',
    title: '优化结果',
  },
  {
    dataIndex: 'diff',
    className: 'big-word',
    title: '差值',
  },
];
