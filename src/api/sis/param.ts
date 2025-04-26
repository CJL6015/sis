import { defHttp } from '/@/utils/http/axios';

enum Api {
  LIST = '/param',
  NAME = '/param/list',
}

export const getParams = (params: any) => defHttp.get<any>({ url: Api.LIST, params });
export const getParamsList = () => defHttp.get<any>({ url: Api.NAME });
