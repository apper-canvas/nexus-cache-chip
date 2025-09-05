import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import Loading from "@/components/ui/Loading";
import { dealsService } from "@/services/api/dealsService";
import DealKanbanBoard from "@/components/organisms/DealKanbanBoard";
import AddDealModal from "@/components/organisms/AddDealModal";
import DealDetailModal from "@/components/organisms/DealDetailModal";
const DealsPage = () => {
  const { toggleSidebar } = useOutletContext();
const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dealsService.getAll();
      setDeals(data);
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to load deals: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
const handleDealClick = (deal) => {
    setSelectedDeal(deal);
    setShowDetailModal(true);
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedDeal(null);
  };

const handleViewDealPage = (dealId) => {
    navigate(`/deals/${dealId}`);
  };
const handleAddDeal = async (dealData) => {
    try {
      const newDeal = await dealsService.create(dealData);
      setDeals(prev => [newDeal, ...prev]);
      return newDeal;
    } catch (error) {
      throw error;
    }
  };

  const handleStatusChange = async (dealId, newStatus, newStage) => {
    try {
      const updatedDeal = await dealsService.updateStatus(dealId, newStatus, newStage);
      setDeals(prev => prev.map(deal => 
deal.Id === dealId ? updatedDeal : deal
      ));
      toast.success(`Deal moved to ${newStage}`);
    } catch (err) {
      toast.error(`Failed to update deal: ${err.message}`);
    }
  };
{selectedDeal && (
          <DealDetailModal
            deal={selectedDeal}
            isOpen={showDetailModal}
            onClose={handleDetailModalClose}
          />
        )}
  if (loading) return <Loading type="page" />;
  if (error) return (
    <div className="flex-1 overflow-hidden">
      <Header title="Deals" onMenuClick={toggleSidebar} />
      <div className="p-6">
        <div className="text-center text-red-500">
          Error: {error}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden">
      <Header
title="Deals"
        onMenuClick={toggleSidebar}
        onAddClick={() => setShowAddModal(true)}
        buttonText="Add Deal"
      />
      
      <div className="p-6">
        <DealKanbanBoard 
          deals={deals} 
onStatusChange={handleStatusChange}
          onDealClick={handleDealClick}
        />
      </div>
<AddDealModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddDeal}
      />
    </div>
  );
};

export default DealsPage;