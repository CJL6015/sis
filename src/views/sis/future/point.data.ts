import { BasicColumn } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: 'ID',
    dataIndex: 'ID',
  },
  {
    title: 'TimeTag',
    dataIndex: 'TimeTag',
  },
  {
    title: 'P1_MW',
    dataIndex: 'p1Mw',
    edit: true,
    editRule: true,
    editComponent: 'InputNumber',
  },
  {
    title: 'P2_MW',
    dataIndex: 'p2Mw',
    edit: true,
    editRule: true,
    editComponent: 'InputNumber',
  },
];
