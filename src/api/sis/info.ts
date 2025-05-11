import { defHttp } from '/@/utils/http/axios';

enum Api {
  INFO = '/main/info',
  LOAD_TREND = '/main/load/trend',
  PUMP_TREND = '/main/pump/trend',
  POINT_INFO = '/main/point/info',
  POINT_INFO1 = '/main/point/info1',
}

export const getInfo = () => defHttp.get<any>({ url: Api.INFO });

export const getLoadTrend = (params: any) => defHttp.get<any>({ url: Api.LOAD_TREND, params });

export const getPumpTrend = (params: any) => defHttp.get<any>({ url: Api.PUMP_TREND, params });

export const getPointInfo = () => defHttp.get<any>({ url: Api.POINT_INFO });
export const getPointInfo1 = () => defHttp.get<any>({ url: Api.POINT_INFO1 });
