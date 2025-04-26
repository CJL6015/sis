import { defHttp } from '/@/utils/http/axios';

enum Api {
  UPLOAD = '/future/upload',
  SUBMIT = '/future/submit',
  STATUS = '/future/status',
  DATA = '/future/data',
}

export const upload = (params: any) => defHttp.post<any>({ url: Api.UPLOAD, data: params });
export const submit = (params: any) => defHttp.post<any>({ url: Api.SUBMIT, data: params });
export const getStatus = () => defHttp.get<any>({ url: Api.STATUS });
export const getData = () => defHttp.get<any>({ url: Api.DATA });
