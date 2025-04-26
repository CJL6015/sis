import { defHttp } from '/@/utils/http/axios';
import { ModelCardItem, ModelQueryParams, ModelInfo } from './model/models';

enum Api {
  MODEL_CARD_LIST = '/model/card/list',
  MODEL_INFO = '/model/info/',
  MODEL_SAVE = '/model/',
}
export const modelCardListApi = (params?: ModelQueryParams) =>
  defHttp.get<ModelCardItem[]>({ url: Api.MODEL_CARD_LIST, params });

export const modelInfoApi = (id: any) => defHttp.get<ModelInfo>({ url: Api.MODEL_INFO + id });

export const modelSaveApi = (params?: any) =>
  defHttp.post<number>({ url: Api.MODEL_SAVE, data: params });
