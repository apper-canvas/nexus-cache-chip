import contactsData from "@/services/mockData/contacts.json";

class ContactService {
constructor() {
    this.contacts = [...contactsData];
  }

  async getAll() {
// Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.contacts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

async getById(id) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    const contact = this.contacts.find(contact => contact.Id === parseInt(id));
    if (!contact) {
      throw new Error("Contact not found");
    }
    return { ...contact };
  }

async create(contactData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = this.contacts.length > 0 
      ? Math.max(...this.contacts.map(contact => contact.Id)) 
      : 0;
    
    const newContact = {
      Id: maxId + 1,
      ...contactData,
      lastContactDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.contacts.push(newContact);
    
    // Update company metrics if company is specified
    if (newContact.companyId) {
      try {
        const companiesService = (await import('./companiesService')).default;
        await companiesService.updateCompanyMetrics(newContact.companyId);
      } catch (error) {
        console.error('Failed to update company metrics:', error);
      }
    }
    
    return { ...newContact };
  }

async update(id, contactData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const index = this.contacts.findIndex(contact => contact.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Contact not found");
    }

    this.contacts[index] = {
      ...this.contacts[index],
      ...contactData,
      updatedAt: new Date().toISOString()
    };

    return { ...this.contacts[index] };
  }
async delete(id) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const index = this.contacts.findIndex(contact => contact.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Contact not found");
    }

    this.contacts.splice(index, 1);
    return true;
  }
}
export const contactService = new ContactService();