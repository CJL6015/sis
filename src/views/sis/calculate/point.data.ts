import { BasicColumn } from '/@/components/Table';

export const columns: BasicColumn[] = [
  {
    title: '参数名称(单位)',
    dataIndex: 'name',
  },
  {
    title: '#1机组',
    dataIndex: 'unit1',
    editComponent: 'InputNumber',
  },
  {
    title: '#2机组',
    dataIndex: 'unit2',
    editComponent: 'InputNumber',
  },
];
