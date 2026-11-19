import { RequestService } from '@services/RequestService';
import type { Activity } from '@models/Activity.model';
import type { ActivityAddPayload, ActivityEditPayload, ActivityCompletePayload } from '@validators/ActivityValidator';
import type { PaginatedResponse, QueryParams } from '@appTypes/Utils.type';

export const ActivityService = {
  getActivities(params: QueryParams & { contactId?: string; dealId?: string }): Promise<PaginatedResponse<Activity>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.contactId) query.set('contactId', params.contactId);
    if (params.dealId) query.set('dealId', params.dealId);
    if (params.search) query.set('search', params.search);
    return RequestService.get<PaginatedResponse<Activity>>(`/activities?${query.toString()}`);
  },

  createActivity(payload: ActivityAddPayload): Promise<Activity> {
    return RequestService.post<Activity>('/activities', payload);
  },

  updateActivity(id: string, payload: ActivityEditPayload): Promise<Activity> {
    return RequestService.patch<Activity>(`/activities/${id}`, payload);
  },

  completeActivity(payload: ActivityCompletePayload): Promise<Activity> {
    return RequestService.patch<Activity>(`/activities/${payload.id}/complete`, payload);
  },

  deleteActivity(id: string): Promise<void> {
    return RequestService.delete<void>(`/activities/${id}`);
  },
};
