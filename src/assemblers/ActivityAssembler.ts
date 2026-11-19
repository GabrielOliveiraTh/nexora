import type { Activity, ActivityFormData, ActivityEditData } from '@models/Activity.model';
import { ActivityType, ActivityStatus } from '@models/Activity.model';

export const ActivityAssembler = {
  assembleNormalizedFormActivity(apiActivity: Activity): ActivityFormData {
    return {
      type: apiActivity.type,
      subject: apiActivity.subject,
      description: apiActivity.description,
      status: apiActivity.status,
      contactId: apiActivity.contactId,
      dealId: apiActivity.dealId,
      companyId: apiActivity.companyId,
      ownerId: apiActivity.ownerId,
      dueDate: apiActivity.dueDate,
      duration: apiActivity.duration,
    };
  },

  assembleFormNormalizedActivity(
    previous: ActivityFormData,
    edits: ActivityEditData,
  ): ActivityEditData {
    const result = { ...edits } as Record<string, unknown>;
    for (const key of Object.keys(previous)) {
      if (edits[key as keyof ActivityEditData] === undefined && previous[key as keyof ActivityFormData] !== undefined) {
        result[key] = '';
      }
    }
    return result as ActivityEditData;
  },

  assembleEmptyForm(): ActivityFormData {
    return {
      type: ActivityType.Note,
      subject: '',
      description: '',
      status: ActivityStatus.Pending,
      contactId: '',
      dealId: null,
      companyId: null,
      ownerId: '',
      dueDate: null,
      duration: null,
    };
  },
};
