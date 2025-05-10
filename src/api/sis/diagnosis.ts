import { defHttp } from '/@/utils/http/axios';

enum Api {
  SCATTER = '/diagnosis/scatter',
  CLEAN_DATA = '/diagnosis/getCleanData',
}

export const getScatterData = (params: any) =>
  defHttp.get<any>({ url: Api.SCATTER, params, timeout: 20000 });

export const getCleanData = (params: any) =>
  defHttp.get<any>({ url: Api.CLEAN_DATA, params, timeout: 20000 });
