import { toast } from 'react-toastify';

class DealsService {
  constructor() {
    this.tableName = 'deal_c';
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "source_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
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
      return (response.data || []).map(deal => ({
        Id: deal.Id,
        title: deal.title_c,
        value: deal.value_c || 0,
        probability: deal.probability_c || 50,
        expectedCloseDate: deal.expected_close_date_c,
        stage: deal.stage_c || 'Lead',
        status: deal.status_c || 'active',
        priority: deal.priority_c,
        source: deal.source_c,
        description: deal.description_c,
        notes: deal.notes_c,
        assignedTo: deal.assigned_to_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        contactName: deal.contact_name_c || deal.contact_id_c?.Name || 'Unknown Contact',
        company: deal.company_c || 'No Company',
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      }));
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to load deals');
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "source_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response?.data) {
        return null;
      }

      const deal = response.data;
      return {
        Id: deal.Id,
        title: deal.title_c,
        value: deal.value_c || 0,
        probability: deal.probability_c || 50,
        expectedCloseDate: deal.expected_close_date_c,
        stage: deal.stage_c || 'Lead',
        status: deal.status_c || 'active',
        priority: deal.priority_c,
        source: deal.source_c,
        description: deal.description_c,
        notes: deal.notes_c,
        assignedTo: deal.assigned_to_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        contactName: deal.contact_name_c || deal.contact_id_c?.Name || 'Unknown Contact',
        company: deal.company_c || 'No Company',
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error);
      return null;
    }
  }

  async create(dealData) {
    try {
      const params = {
        records: [{
          Name: dealData.title?.trim(),
          title_c: dealData.title?.trim(),
          value_c: dealData.value || 0,
          probability_c: dealData.probability || 50,
          expected_close_date_c: dealData.expectedCloseDate,
          stage_c: dealData.stage || 'Lead',
          status_c: dealData.status || 'active',
          priority_c: dealData.priority || 'Medium',
          source_c: dealData.source || 'Direct',
          description_c: dealData.description?.trim() || '',
          notes_c: dealData.notes?.trim() || '',
          assigned_to_c: dealData.assignedTo || 'Current User',
          contact_id_c: dealData.contactId ? parseInt(dealData.contactId) : null,
          contact_name_c: dealData.contactName || null,
          company_c: dealData.company || 'No Company'
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
          console.error(`Failed to create ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Deal created successfully');
          const created = successful[0].data;
          return {
            Id: created.Id,
            title: created.title_c,
            value: created.value_c || 0,
            probability: created.probability_c || 50,
            expectedCloseDate: created.expected_close_date_c,
            stage: created.stage_c || 'Lead',
            status: created.status_c || 'active',
            priority: created.priority_c,
            source: created.source_c,
            description: created.description_c,
            notes: created.notes_c,
            assignedTo: created.assigned_to_c,
            contactId: created.contact_id_c?.Id || created.contact_id_c,
            contactName: created.contact_name_c || created.contact_id_c?.Name || 'Unknown Contact',
            company: created.company_c || 'No Company',
            createdAt: created.CreatedOn,
            updatedAt: created.ModifiedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error('Failed to create deal');
      return null;
    }
  }

  async update(id, dealData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };

      // Only include fields that are being updated
      if (dealData.title !== undefined) updateData.title_c = dealData.title?.trim();
      if (dealData.value !== undefined) updateData.value_c = dealData.value;
      if (dealData.probability !== undefined) updateData.probability_c = dealData.probability;
      if (dealData.expectedCloseDate !== undefined) updateData.expected_close_date_c = dealData.expectedCloseDate;
      if (dealData.stage !== undefined) updateData.stage_c = dealData.stage;
      if (dealData.status !== undefined) updateData.status_c = dealData.status;
      if (dealData.priority !== undefined) updateData.priority_c = dealData.priority;
      if (dealData.source !== undefined) updateData.source_c = dealData.source;
      if (dealData.description !== undefined) updateData.description_c = dealData.description?.trim();
      if (dealData.notes !== undefined) updateData.notes_c = dealData.notes?.trim();
      if (dealData.assignedTo !== undefined) updateData.assigned_to_c = dealData.assignedTo;
      if (dealData.contactId !== undefined) updateData.contact_id_c = dealData.contactId ? parseInt(dealData.contactId) : null;
      if (dealData.contactName !== undefined) updateData.contact_name_c = dealData.contactName;
      if (dealData.company !== undefined) updateData.company_c = dealData.company;

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
          console.error(`Failed to update ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Deal updated successfully');
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            title: updated.title_c,
            value: updated.value_c || 0,
            probability: updated.probability_c || 50,
            expectedCloseDate: updated.expected_close_date_c,
            stage: updated.stage_c || 'Lead',
            status: updated.status_c || 'active',
            priority: updated.priority_c,
            source: updated.source_c,
            description: updated.description_c,
            notes: updated.notes_c,
            assignedTo: updated.assigned_to_c,
            contactId: updated.contact_id_c?.Id || updated.contact_id_c,
            contactName: updated.contact_name_c || updated.contact_id_c?.Name || 'Unknown Contact',
            company: updated.company_c || 'No Company',
            createdAt: updated.CreatedOn,
            updatedAt: updated.ModifiedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Failed to update deal');
      return null;
    }
  }

  async updateStatus(id, status, stage) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          status_c: status,
          stage_c: stage
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
          console.error(`Failed to update ${failed.length} deal statuses:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Deal status updated successfully');
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            title: updated.title_c,
            value: updated.value_c || 0,
            probability: updated.probability_c || 50,
            expectedCloseDate: updated.expected_close_date_c,
            stage: updated.stage_c || 'Lead',
            status: updated.status_c || 'active',
            priority: updated.priority_c,
            source: updated.source_c,
            description: updated.description_c,
            notes: updated.notes_c,
            assignedTo: updated.assigned_to_c,
            contactId: updated.contact_id_c?.Id || updated.contact_id_c,
            contactName: updated.contact_name_c || updated.contact_id_c?.Name || 'Unknown Contact',
            company: updated.company_c || 'No Company',
            createdAt: updated.CreatedOn,
            updatedAt: updated.ModifiedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating deal status:', error);
      toast.error('Failed to update deal status');
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
          console.error(`Failed to delete ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          toast.success('Deal deleted successfully');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast.error('Failed to delete deal');
      return false;
    }
  }

  async getByStage(stage) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "source_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "contact_name_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{"FieldName": "stage_c", "Operator": "EqualTo", "Values": [stage]}],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(deal => ({
        Id: deal.Id,
        title: deal.title_c,
        value: deal.value_c || 0,
        probability: deal.probability_c || 50,
        expectedCloseDate: deal.expected_close_date_c,
        stage: deal.stage_c || 'Lead',
        status: deal.status_c || 'active',
        priority: deal.priority_c,
        source: deal.source_c,
        description: deal.description_c,
        notes: deal.notes_c,
        assignedTo: deal.assigned_to_c,
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        contactName: deal.contact_name_c || deal.contact_id_c?.Name || 'Unknown Contact',
        company: deal.company_c || 'No Company',
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      }));
    } catch (error) {
      console.error('Error fetching deals by stage:', error);
      return [];
    }
  }

  async getPipelineStats() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "value_c"}}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return {
          Lead: { count: 0, value: 0 },
          Qualified: { count: 0, value: 0 },
          Proposal: { count: 0, value: 0 },
          Negotiation: { count: 0, value: 0 },
          Closed: { count: 0, value: 0 }
        };
      }

      const stats = {
        Lead: { count: 0, value: 0 },
        Qualified: { count: 0, value: 0 },
        Proposal: { count: 0, value: 0 },
        Negotiation: { count: 0, value: 0 },
        Closed: { count: 0, value: 0 }
      };

      (response.data || []).forEach(deal => {
        const stage = deal.stage_c || 'Lead';
        if (stats[stage]) {
          stats[stage].count++;
          stats[stage].value += deal.value_c || 0;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching pipeline stats:', error);
      return {
        Lead: { count: 0, value: 0 },
        Qualified: { count: 0, value: 0 },
        Proposal: { count: 0, value: 0 },
        Negotiation: { count: 0, value: 0 },
        Closed: { count: 0, value: 0 }
      };
    }
  }
}

export const dealsService = new DealsService();