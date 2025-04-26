import { defHttp } from '/@/utils/http/axios';

enum Api {
  CALCULATE_DATA = '/calculate/data',
  REALTIME_DATA = '/calculate/realtime',
}

export const getCalculateData = (params: any) =>
  defHttp.get<any>({ url: Api.CALCULATE_DATA, params });

export const getRealtimeData = () => defHttp.get<any>({ url: Api.REALTIME_DATA });
