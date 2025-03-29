import { defHttp } from '/@/utils/http/axios';

enum Api {
  PARAM = '/budgetary/param',
  SUBMIT = '/budgetary/submit',
  DATA = '/budgetary/data',
  STATUS = '/budgetary/status',
}

export const getParams = () => defHttp.get<any>({ url: Api.PARAM });

export const getStatus = () => defHttp.get<any>({ url: Api.STATUS });

export const getData = () => defHttp.get<any>({ url: Api.DATA });

export const submit = (params: any) => defHttp.post<any>({ url: Api.SUBMIT, data: params });
