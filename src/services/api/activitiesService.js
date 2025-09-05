import { toast } from 'react-toastify';

class ActivitiesService {
  constructor() {
    this.tableName = 'activity_c';
    this.apperClient = null;
    this.initClient();
  }

  initClient() {
    try {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    } catch (error) {
      console.error('Failed to initialize ApperClient:', error);
    }
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "deal_title_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Map database fields to UI format
      return (response.data || []).map(activity => ({
        Id: activity.Id,
        type: activity.type_c,
        title: activity.title_c,
        description: activity.description_c,
        status: activity.status_c,
        priority: activity.priority_c,
        dueDate: activity.due_date_c,
        completedAt: activity.completed_at_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        contactName: activity.contact_name_c || activity.contact_id_c?.Name,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        dealTitle: activity.deal_title_c || activity.deal_id_c?.Name,
        assignedTo: activity.assigned_to_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn,
        outcome: activity.outcome_c
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "deal_title_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }

      const activity = response.data;
      return {
        Id: activity.Id,
        type: activity.type_c,
        title: activity.title_c,
        description: activity.description_c,
        status: activity.status_c,
        priority: activity.priority_c,
        dueDate: activity.due_date_c,
        completedAt: activity.completed_at_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        contactName: activity.contact_name_c || activity.contact_id_c?.Name,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        dealTitle: activity.deal_title_c || activity.deal_id_c?.Name,
        assignedTo: activity.assigned_to_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn,
        outcome: activity.outcome_c
      };
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error);
      return null;
    }
  }

  async create(activityData) {
    try {
      const params = {
        records: [{
          Name: activityData.title?.trim(),
          type_c: activityData.type,
          title_c: activityData.title?.trim(),
          description_c: activityData.description?.trim() || '',
          status_c: activityData.status || 'pending',
          priority_c: activityData.priority || 'normal',
          due_date_c: activityData.dueDate,
          contact_id_c: activityData.contactId ? parseInt(activityData.contactId) : null,
          contact_name_c: activityData.contactName || null,
          deal_id_c: activityData.dealId ? parseInt(activityData.dealId) : null,
          deal_title_c: activityData.dealTitle || null,
          assigned_to_c: activityData.assignedTo || 'Current User',
          outcome_c: null
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} activities:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Activity created successfully');
          const created = successful[0].data;
          return {
            Id: created.Id,
            type: created.type_c,
            title: created.title_c,
            description: created.description_c,
            status: created.status_c,
            priority: created.priority_c,
            dueDate: created.due_date_c,
            completedAt: created.completed_at_c,
            contactId: created.contact_id_c?.Id || created.contact_id_c,
            contactName: created.contact_name_c || created.contact_id_c?.Name,
            dealId: created.deal_id_c?.Id || created.deal_id_c,
            dealTitle: created.deal_title_c || created.deal_id_c?.Name,
            assignedTo: created.assigned_to_c,
            createdAt: created.CreatedOn,
            updatedAt: created.ModifiedOn,
            outcome: created.outcome_c
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Failed to create activity');
      return null;
    }
  }

  async update(id, activityData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };

      // Only include fields that are being updated
      if (activityData.type !== undefined) updateData.type_c = activityData.type;
      if (activityData.title !== undefined) updateData.title_c = activityData.title?.trim();
      if (activityData.description !== undefined) updateData.description_c = activityData.description?.trim();
      if (activityData.priority !== undefined) updateData.priority_c = activityData.priority;
      if (activityData.dueDate !== undefined) updateData.due_date_c = activityData.dueDate;
      if (activityData.contactId !== undefined) updateData.contact_id_c = activityData.contactId ? parseInt(activityData.contactId) : null;
      if (activityData.contactName !== undefined) updateData.contact_name_c = activityData.contactName;
      if (activityData.dealId !== undefined) updateData.deal_id_c = activityData.dealId ? parseInt(activityData.dealId) : null;
      if (activityData.dealTitle !== undefined) updateData.deal_title_c = activityData.dealTitle;
      if (activityData.assignedTo !== undefined) updateData.assigned_to_c = activityData.assignedTo;

      const params = {
        records: [updateData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} activities:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Activity updated successfully');
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            type: updated.type_c,
            title: updated.title_c,
            description: updated.description_c,
            status: updated.status_c,
            priority: updated.priority_c,
            dueDate: updated.due_date_c,
            completedAt: updated.completed_at_c,
            contactId: updated.contact_id_c?.Id || updated.contact_id_c,
            contactName: updated.contact_name_c || updated.contact_id_c?.Name,
            dealId: updated.deal_id_c?.Id || updated.deal_id_c,
            dealTitle: updated.deal_title_c || updated.deal_id_c?.Name,
            assignedTo: updated.assigned_to_c,
            createdAt: updated.CreatedOn,
            updatedAt: updated.ModifiedOn,
            outcome: updated.outcome_c
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Failed to update activity');
      return null;
    }
  }

  async complete(id, outcome = '') {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          status_c: 'completed',
          completed_at_c: new Date().toISOString(),
          outcome_c: outcome.trim() || 'Task completed successfully'
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to complete ${failed.length} activities:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Activity completed successfully');
          const completed = successful[0].data;
          return {
            Id: completed.Id,
            type: completed.type_c,
            title: completed.title_c,
            description: completed.description_c,
            status: completed.status_c,
            priority: completed.priority_c,
            dueDate: completed.due_date_c,
            completedAt: completed.completed_at_c,
            contactId: completed.contact_id_c?.Id || completed.contact_id_c,
            contactName: completed.contact_name_c || completed.contact_id_c?.Name,
            dealId: completed.deal_id_c?.Id || completed.deal_id_c,
            dealTitle: completed.deal_title_c || completed.deal_id_c?.Name,
            assignedTo: completed.assigned_to_c,
            createdAt: completed.CreatedOn,
            updatedAt: completed.ModifiedOn,
            outcome: completed.outcome_c
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error completing activity:', error);
      toast.error('Failed to complete activity');
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} activities:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Activity deleted successfully');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
      return false;
    }
  }

  async getTasks() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "deal_title_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [{"FieldName": "status_c", "Operator": "NotEqualTo", "Values": ["completed"]}],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(activity => ({
        Id: activity.Id,
        type: activity.type_c,
        title: activity.title_c,
        description: activity.description_c,
        status: activity.status_c,
        priority: activity.priority_c,
        dueDate: activity.due_date_c,
        completedAt: activity.completed_at_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        contactName: activity.contact_name_c || activity.contact_id_c?.Name,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        dealTitle: activity.deal_title_c || activity.deal_id_c?.Name,
        assignedTo: activity.assigned_to_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn,
        outcome: activity.outcome_c
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async getHistory() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "deal_title_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [{"FieldName": "status_c", "Operator": "EqualTo", "Values": ["completed"]}],
        orderBy: [{"fieldName": "completed_at_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(activity => ({
        Id: activity.Id,
        type: activity.type_c,
        title: activity.title_c,
        description: activity.description_c,
        status: activity.status_c,
        priority: activity.priority_c,
        dueDate: activity.due_date_c,
        completedAt: activity.completed_at_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        contactName: activity.contact_name_c || activity.contact_id_c?.Name,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        dealTitle: activity.deal_title_c || activity.deal_id_c?.Name,
        assignedTo: activity.assigned_to_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn,
        outcome: activity.outcome_c
      }));
    } catch (error) {
      console.error('Error fetching activity history:', error);
      return [];
    }
  }

  async getByContact(contactId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "deal_title_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [{"FieldName": "contact_id_c", "Operator": "EqualTo", "Values": [parseInt(contactId)]}],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(activity => ({
        Id: activity.Id,
        type: activity.type_c,
        title: activity.title_c,
        description: activity.description_c,
        status: activity.status_c,
        priority: activity.priority_c,
        dueDate: activity.due_date_c,
        completedAt: activity.completed_at_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        contactName: activity.contact_name_c || activity.contact_id_c?.Name,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        dealTitle: activity.deal_title_c || activity.deal_id_c?.Name,
        assignedTo: activity.assigned_to_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn,
        outcome: activity.outcome_c
      }));
    } catch (error) {
      console.error('Error fetching activities by contact:', error);
      return [];
    }
  }

  async getByDeal(dealId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "deal_title_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [{"FieldName": "deal_id_c", "Operator": "EqualTo", "Values": [parseInt(dealId)]}],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(activity => ({
        Id: activity.Id,
        type: activity.type_c,
        title: activity.title_c,
        description: activity.description_c,
        status: activity.status_c,
        priority: activity.priority_c,
        dueDate: activity.due_date_c,
        completedAt: activity.completed_at_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        contactName: activity.contact_name_c || activity.contact_id_c?.Name,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        dealTitle: activity.deal_title_c || activity.deal_id_c?.Name,
        assignedTo: activity.assigned_to_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn,
        outcome: activity.outcome_c
      }));
    } catch (error) {
      console.error('Error fetching activities by deal:', error);
      return [];
    }
  }

  async getOverdue() {
    try {
      const now = new Date().toISOString();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "deal_title_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "outcome_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        whereGroups: [{
          "operator": "AND",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "status_c", "operator": "NotEqualTo", "values": ["completed"]},
                {"fieldName": "due_date_c", "operator": "LessThan", "values": [now]},
                {"fieldName": "due_date_c", "operator": "HasValue", "values": []}
              ],
              "operator": "AND"
            }
          ]
        }],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(activity => ({
        Id: activity.Id,
        type: activity.type_c,
        title: activity.title_c,
        description: activity.description_c,
        status: activity.status_c,
        priority: activity.priority_c,
        dueDate: activity.due_date_c,
        completedAt: activity.completed_at_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        contactName: activity.contact_name_c || activity.contact_id_c?.Name,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        dealTitle: activity.deal_title_c || activity.deal_id_c?.Name,
        assignedTo: activity.assigned_to_c,
        createdAt: activity.CreatedOn,
        updatedAt: activity.ModifiedOn,
        outcome: activity.outcome_c
      }));
    } catch (error) {
      console.error('Error fetching overdue activities:', error);
      return [];
    }
  }
}

// Export singleton instance
export const activitiesService = new ActivitiesService();