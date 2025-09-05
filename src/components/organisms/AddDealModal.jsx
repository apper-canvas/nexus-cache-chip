import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import { contactService } from "@/services/api/contactService";

const AddDealModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    contactId: "",
    value: "",
    probability: 50,
    expectedCloseDate: "",
    notes: "",
    assignedTo: ""
  });

  const [contacts, setContacts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      toast.error("Failed to load contacts");
    } finally {
      setContactsLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    const value = field === 'probability' ? parseInt(e.target.value) : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Deal title is required";
    }
    
    if (!formData.contactId) {
      newErrors.contactId = "Please select a contact";
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = "Deal value must be greater than 0";
    }
    
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = "Expected close date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Find selected contact details
const selectedContact = contacts.find(c => c.Id === parseInt(formData.contactId));
      
      const dealData = {
        title: formData.title.trim(),
        contactId: parseInt(formData.contactId),
        contactName: selectedContact ? selectedContact.name : 'Unknown',
        company: selectedContact ? selectedContact.company || 'No Company' : 'No Company',
        value: parseFloat(formData.value),
        probability: formData.probability,
        expectedCloseDate: formData.expectedCloseDate,
        notes: formData.notes.trim(),
        assignedTo: formData.assignedTo.trim() || null,
        stage: 'Lead',
        status: 'active'
      };

      await onSave(dealData);
      
      // Reset form
      setFormData({
        title: "",
        contactId: "",
        value: "",
        probability: 50,
        expectedCloseDate: "",
        notes: "",
        assignedTo: ""
      });
      
      setErrors({});
      toast.success("Deal created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to create deal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: "",
        contactId: "",
        value: "",
        probability: 50,
        expectedCloseDate: "",
        notes: "",
        assignedTo: ""
      });
      setErrors({});
      onClose();
    }
  };

  const formatTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Deal"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Contact Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Deal Title"
            type="text"
            value={formData.title}
            onChange={handleChange("title")}
            error={errors.title}
            placeholder="Enter deal title"
            required
            disabled={isLoading}
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Contact <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.contactId}
              onChange={handleChange("contactId")}
              disabled={isLoading || contactsLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              <option value="">
                {contactsLoading ? "Loading contacts..." : "Select a contact"}
              </option>
              {contacts.map(contact => (
<option key={contact.Id} value={contact.Id}>
                  {contact.name} {contact.company && `- ${contact.company}`}
                </option>
              ))}
            </select>
            {errors.contactId && (
              <p className="text-xs text-error mt-1">{errors.contactId}</p>
            )}
          </div>
        </div>

        {/* Value and Probability Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Deal Value (USD)"
            type="number"
            value={formData.value}
            onChange={handleChange("value")}
            error={errors.value}
            placeholder="Enter deal value"
            required
            disabled={isLoading}
            min="0"
            step="0.01"
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Probability ({formData.probability}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.probability}
              onChange={handleChange("probability")}
              disabled={isLoading}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Expected Close Date and Assigned To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Expected Close Date"
            type="date"
            value={formData.expectedCloseDate}
            onChange={handleChange("expectedCloseDate")}
            error={errors.expectedCloseDate}
            required
            disabled={isLoading}
            min={formatTodayDate()}
          />
          
          <FormField
            label="Assigned To"
            type="text"
            value={formData.assignedTo}
            onChange={handleChange("assignedTo")}
            error={errors.assignedTo}
            placeholder="Enter assignee name"
            disabled={isLoading}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={handleChange("notes")}
            placeholder="Add any additional notes about this deal..."
            rows={4}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed bg-white resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || contactsLoading}
            className="btn-primary"
          >
            {isLoading ? "Creating Deal..." : "Create Deal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDealModal;