import { defHttp } from '/@/utils/http/axios';

enum Api {
  LIST = '/param',
  NAME = '/param/list',
}

export const getParams = () => defHttp.get<any>({ url: Api.LIST });
export const getParamsList = () => defHttp.get<any>({ url: Api.NAME });
