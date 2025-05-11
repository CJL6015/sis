import { defHttp } from '/@/utils/http/axios';

enum Api {
  REPORT = '/test/getTestReport',
  RESULT = '/test/getTestResult',
  SUBMIT = '/test/submit/',
}

export const getReport = (params: any) => defHttp.get<any>({ url: Api.REPORT, params });
export const getResult = (params: any) => defHttp.get<any>({ url: Api.RESULT, params });
export const submit = (unit: any) => defHttp.post<any>({ url: Api.SUBMIT + unit });
