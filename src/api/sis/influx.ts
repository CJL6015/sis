import { defHttp } from '/@/utils/http/axios';

enum Api {
  NOW = '/influx/now/list',
  HISTORY = '/influx/history',
}

export const getRealtime = (params: any) => defHttp.get<any>({ url: Api.NOW, params });

export const getHistory = (params: any) => defHttp.get<any>({ url: Api.HISTORY, params });
