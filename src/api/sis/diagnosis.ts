import { defHttp } from '/@/utils/http/axios';

enum Api {
  SCATTER = '/diagnosis/scatter',
  CLEAN_DATA = '/diagnosis/getCleanData',
  CLEAN_DATA1 = '/diagnosis/getCleanData1',
  CLEAN_DATA2 = '/diagnosis/getCleanData2',
  GATE_DIAGNODID_DATA = '/diagnosis/getGateDiagnosisData',
  GATE_DIAGNODID_DATA2 = '/diagnosis/getGateDiagnosisData2',
}

export const getScatterData = (params: any) =>
  defHttp.get<any>({ url: Api.SCATTER, params, timeout: 20000 });

export const getCleanData = (params: any) =>
  defHttp.get<any>({ url: Api.CLEAN_DATA, params, timeout: 20000 });

export const getCleanData1 = (params: any) =>
  defHttp.get<any>({ url: Api.CLEAN_DATA1, params, timeout: 20000 });

export const getCleanData2 = (params: any) =>
  defHttp.get<any>({ url: Api.CLEAN_DATA2, params, timeout: 20000 });
export const getGateDiagnosisData = () =>
  defHttp.get<any>({ url: Api.GATE_DIAGNODID_DATA, timeout: 20000 });
export const getGateDiagnosisData2 = () =>
  defHttp.get<any>({ url: Api.GATE_DIAGNODID_DATA2, timeout: 20000 });
