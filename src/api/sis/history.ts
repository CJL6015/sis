import { defHttp } from '/@/utils/http/axios';

enum Api {
  HISTORY = '/history',
  SCATTER = '/history/scatter',
}

export const getHistory = (params: any) => defHttp.get<any>({ url: Api.HISTORY, params });

export const getHistoryScatter = (params: any) => defHttp.get<any>({ url: Api.SCATTER, params });
