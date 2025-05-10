import { defHttp } from '/@/utils/http/axios';

enum Api {
  CALCULATE_DATA = '/calculate/data',
  REALTIME_DATA = '/calculate/realtime',
  OVERVIEW_TABLE = '/diagnosis/table',
}

export const getCalculateData = (params: any) =>
  defHttp.get<any>({ url: Api.CALCULATE_DATA, params });

export const getRealtimeData = () => defHttp.get<any>({ url: Api.REALTIME_DATA });

export const getOverviewTable = () => defHttp.get<any>({ url: Api.OVERVIEW_TABLE });
