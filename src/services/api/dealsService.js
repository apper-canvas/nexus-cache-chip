import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

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
      // Only include updateable fields based on schema visibility
      const params = {
        records: [{
          Name: dealData.title, // Name field is updateable
          title_c: dealData.title,
          contact_id_c: dealData.contactId ? parseInt(dealData.contactId) : null,
          contact_name_c: dealData.contactName,
          company_c: dealData.company,
          value_c: parseFloat(dealData.value),
          probability_c: parseInt(dealData.probability),
          expected_close_date_c: dealData.expectedCloseDate,
          status_c: dealData.status || 'active',
          stage_c: dealData.stage || 'Lead',
          description_c: dealData.description,
          notes_c: dealData.notes,
          assigned_to_c: dealData.assignedTo,
          source_c: dealData.source
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to create deal');
        }

        if (successful.length > 0) {
          const newDeal = successful[0].data;
          return {
            Id: newDeal.Id,
            title: newDeal.title_c,
            value: newDeal.value_c || 0,
            probability: newDeal.probability_c || 50,
            expectedCloseDate: newDeal.expected_close_date_c,
            stage: newDeal.stage_c || 'Lead',
            status: newDeal.status_c || 'active',
            priority: newDeal.priority_c,
            source: newDeal.source_c,
            description: newDeal.description_c,
            notes: newDeal.notes_c,
            assignedTo: newDeal.assigned_to_c,
            contactId: newDeal.contact_id_c?.Id || newDeal.contact_id_c,
            contactName: newDeal.contact_name_c || newDeal.contact_id_c?.Name || 'Unknown Contact',
            company: newDeal.company_c || 'No Company',
            createdAt: newDeal.CreatedOn,
            updatedAt: newDeal.ModifiedOn
          };
        }
      }
      
      throw new Error('No successful records created');
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async update(id, dealData) {
    try {
      // Only include updateable fields based on schema visibility
      const params = {
        records: [{
          Id: parseInt(id),
          Name: dealData.title,
          title_c: dealData.title,
          contact_id_c: dealData.contactId ? parseInt(dealData.contactId) : null,
          contact_name_c: dealData.contactName,
          company_c: dealData.company,
          value_c: parseFloat(dealData.value),
          probability_c: parseInt(dealData.probability),
          expected_close_date_c: dealData.expectedCloseDate,
          status_c: dealData.status,
          stage_c: dealData.stage,
          description_c: dealData.description,
          notes_c: dealData.notes,
          assigned_to_c: dealData.assignedTo,
          source_c: dealData.source
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to update deal');
        }

        if (successful.length > 0) {
          const updatedDeal = successful[0].data;
          return {
            Id: updatedDeal.Id,
            title: updatedDeal.title_c,
            value: updatedDeal.value_c || 0,
            probability: updatedDeal.probability_c || 50,
            expectedCloseDate: updatedDeal.expected_close_date_c,
            stage: updatedDeal.stage_c || 'Lead',
            status: updatedDeal.status_c || 'active',
            priority: updatedDeal.priority_c,
            source: updatedDeal.source_c,
            description: updatedDeal.description_c,
            notes: updatedDeal.notes_c,
            assignedTo: updatedDeal.assigned_to_c,
            contactId: updatedDeal.contact_id_c?.Id || updatedDeal.contact_id_c,
            contactName: updatedDeal.contact_name_c || updatedDeal.contact_id_c?.Name || 'Unknown Contact',
            company: updatedDeal.company_c || 'No Company',
            createdAt: updatedDeal.CreatedOn,
            updatedAt: updatedDeal.ModifiedOn
          };
        }
      }
      
      throw new Error('No successful records updated');
    } catch (error) {
      console.error(`Error updating deal ${id}:`, error);
      throw error;
    }
  }

  async updateStatus(id, status, stage) {
    try {
      // Only update status and stage fields
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
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update status for ${failed.length} deals:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to update deal status');
        }

        if (successful.length > 0) {
          const updatedDeal = successful[0].data;
          return {
            Id: updatedDeal.Id,
            title: updatedDeal.title_c,
            value: updatedDeal.value_c || 0,
            probability: updatedDeal.probability_c || 50,
            expectedCloseDate: updatedDeal.expected_close_date_c,
            stage: updatedDeal.stage_c || 'Lead',
            status: updatedDeal.status_c || 'active',
            priority: updatedDeal.priority_c,
            source: updatedDeal.source_c,
            description: updatedDeal.description_c,
            notes: updatedDeal.notes_c,
            assignedTo: updatedDeal.assigned_to_c,
            contactId: updatedDeal.contact_id_c?.Id || updatedDeal.contact_id_c,
            contactName: updatedDeal.contact_name_c || updatedDeal.contact_id_c?.Name || 'Unknown Contact',
            company: updatedDeal.company_c || 'No Company',
            createdAt: updatedDeal.CreatedOn,
            updatedAt: updatedDeal.ModifiedOn
          };
        }
      }
      
      throw new Error('No successful records updated');
    } catch (error) {
      console.error(`Error updating deal status ${id}:`, error);
      throw error;
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
          return false;
        }
        
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting deal ${id}:`, error);
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
        toast.error(response.message);
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
        contactId: deal.contact_id_c?.Id || deal.contact_id_c,
        contactName: deal.contact_name_c || deal.contact_id_c?.Name || 'Unknown Contact',
        company: deal.company_c || 'No Company',
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      }));
    } catch (error) {
      console.error('Error fetching deals by stage:', error);
      toast.error('Failed to load deals by stage');
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
        ],
        groupBy: ["stage_c"]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return {};
      }

      // Process the grouped data to create pipeline statistics
      const stats = {};
      (response.data || []).forEach(deal => {
        const stage = deal.stage_c || 'Lead';
        if (!stats[stage]) {
          stats[stage] = { count: 0, total: 0 };
        }
        stats[stage].count += 1;
        stats[stage].total += deal.value_c || 0;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching pipeline stats:', error);
      return {};
    }
  }
}

export const dealsService = new DealsService();