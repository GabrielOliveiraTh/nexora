import { RequestService } from '@services/RequestService';
import type { Deal } from '@models/Deal.model';
import type { DealAddPayload, DealEditPayload, DealStageUpdatePayload } from '@validators/DealValidator';
import type { PaginatedResponse, QueryParams } from '@appTypes/Utils.type';

export const DealService = {
  getDeals(params: QueryParams): Promise<PaginatedResponse<Deal>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.search) query.set('search', params.search);
    if (params.sort) {
      query.set('sortField', params.sort.field);
      query.set('sortOrder', params.sort.order);
    }
    return RequestService.get<PaginatedResponse<Deal>>(`/deals?${query.toString()}`);
  },

  getDeal(id: string): Promise<Deal> {
    return RequestService.get<Deal>(`/deals/${id}`);
  },

  getDealsByPipeline(pipelineId: string): Promise<Deal[]> {
    return RequestService.get<Deal[]>(`/pipelines/${pipelineId}/deals`);
  },

  createDeal(payload: DealAddPayload): Promise<Deal> {
    return RequestService.post<Deal>('/deals', payload);
  },

  updateDeal(id: string, payload: DealEditPayload): Promise<Deal> {
    return RequestService.patch<Deal>(`/deals/${id}`, payload);
  },

  updateDealStage(payload: DealStageUpdatePayload): Promise<Deal> {
    return RequestService.patch<Deal>(`/deals/${payload.id}/stage`, payload);
  },

  deleteDeal(id: string): Promise<void> {
    return RequestService.delete<void>(`/deals/${id}`);
  },

  exportDeals(params: QueryParams): Promise<Blob> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    return RequestService.downloadBlob(`/deals/export?${query.toString()}`);
  },
};
