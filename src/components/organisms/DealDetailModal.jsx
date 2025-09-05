import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/molecules/Modal";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";

const DealDetailModal = ({ deal, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);

  useEffect(() => {
    const loadContact = async () => {
      if (deal?.contactId && isOpen) {
        setLoadingContact(true);
        try {
const contactData = await contactService.getById(deal.contactId);
          setContact(contactData);
        } catch (error) {
          console.error('Failed to load contact:', error);
          toast.error('Failed to load contact information');
        } finally {
          setLoadingContact(false);
        }
      }
    };

    loadContact();
  }, [deal?.contactId, isOpen]);

  if (!deal) return null;

  const handleViewContact = () => {
    if (contact) {
      onClose();
      navigate('/contacts');
      // Note: Would need contact detail route for direct navigation
      toast.info(`Contact profile: ${contact.name}`);
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Lead': return 'bg-slate-100 text-slate-800';
      case 'Qualified': return 'bg-blue-100 text-blue-800';
      case 'Proposal': return 'bg-yellow-100 text-yellow-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Closed Won': return 'bg-green-100 text-green-800';
      case 'Closed Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    if (probability >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deal Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Deal Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-900">{deal.title}</h3>
            <p className="text-lg text-slate-600 mt-1">{deal.company}</p>
            <div className="flex items-center space-x-4 mt-3">
              <Badge className={getStageColor(deal.stage)}>
                {deal.stage}
              </Badge>
              <span className="text-sm text-slate-500">
                Created {format(new Date(deal.createdAt), "MMMM dd, yyyy")}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(deal.value)}
            </div>
            <div className={`text-lg font-medium ${getProbabilityColor(deal.probability)}`}>
              {deal.probability}% probability
            </div>
          </div>
        </div>

        {/* Deal Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deal Details */}
          <Card>
            <h4 className="text-lg font-medium text-slate-900 mb-4">Deal Information</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ApperIcon name="Calendar" className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Expected Close Date</p>
                  <p className="text-sm text-slate-900">
                    {deal.expectedCloseDate 
                      ? format(new Date(deal.expectedCloseDate), "MMMM dd, yyyy")
                      : "Not set"
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ApperIcon name="Building2" className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Company</p>
                  <p className="text-sm text-slate-900">{deal.company}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ApperIcon name="DollarSign" className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Deal Value</p>
                  <p className="text-sm text-slate-900">{formatCurrency(deal.value)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ApperIcon name="TrendingUp" className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Probability</p>
                  <p className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                    {deal.probability}%
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-slate-900">Contact Information</h4>
              {contact && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewContact}
                  className="text-xs"
                >
                  View Profile
                </Button>
              )}
            </div>
            
            {loadingContact ? (
              <div className="flex items-center justify-center py-8">
                <Loading />
              </div>
            ) : contact ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{contact.name}</p>
                    <p className="text-sm text-slate-500">{contact.company || "No company"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <ApperIcon name="Mail" className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Email</p>
                    <p className="text-sm text-slate-900">{contact.email}</p>
                  </div>
                </div>

                {contact.phone && (
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Phone" className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Phone</p>
                      <p className="text-sm text-slate-900">{contact.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="UserX" className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No contact assigned</h3>
                <p className="mt-1 text-sm text-slate-500">
                  This deal doesn't have an associated contact.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Deal Notes */}
        {deal.notes && (
          <Card>
            <h4 className="text-lg font-medium text-slate-900 mb-4">Notes</h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{deal.notes}</p>
          </Card>
        )}

        {/* Activity History Placeholder */}
        <Card>
          <h4 className="text-lg font-medium text-slate-900 mb-4">Activity History</h4>
          <div className="text-center py-8">
            <ApperIcon name="Activity" className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No activity history</h3>
            <p className="mt-1 text-sm text-slate-500">
              Activity tracking will be available in a future update.
            </p>
          </div>
        </Card>

        {/* Deal Metadata */}
        <div className="border-t border-slate-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500">
            <div>
              <span className="font-medium">Created:</span> {format(new Date(deal.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {format(new Date(deal.updatedAt), "MMMM dd, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DealDetailModal;