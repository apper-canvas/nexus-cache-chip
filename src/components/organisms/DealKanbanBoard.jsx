import { useState, useMemo } from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import DealCard from "@/components/organisms/DealCard";

const STAGES = [
  { key: 'Lead', label: 'Lead', color: 'bg-slate-100 text-slate-700' },
  { key: 'Qualified', label: 'Qualified', color: 'bg-blue-100 text-blue-700' },
  { key: 'Proposal', label: 'Proposal', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'Negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700' },
  { key: 'Closed', label: 'Closed', color: 'bg-green-100 text-green-700' }
];

const DealKanbanBoard = ({ deals = [], onStatusChange }) => {
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Group deals by stage and calculate totals
  const stageData = useMemo(() => {
    const grouped = STAGES.reduce((acc, stage) => {
      acc[stage.key] = {
        deals: deals.filter(deal => deal.stage === stage.key),
        total: 0,
        count: 0
      };
      return acc;
    }, {});

    // Calculate totals
    Object.keys(grouped).forEach(stageKey => {
      const stageDeals = grouped[stageKey].deals;
      grouped[stageKey].count = stageDeals.length;
      grouped[stageKey].total = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    });

    return grouped;
  }, [deals]);

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, stageKey) => {
    e.preventDefault();
    setDragOverStage(stageKey);
  };

  const handleDragLeave = (e) => {
    // Only clear if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e, stageKey) => {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedDeal && draggedDeal.stage !== stageKey) {
      const statusMap = {
        'Lead': 'lead',
        'Qualified': 'qualified', 
        'Proposal': 'proposal',
        'Negotiation': 'negotiation',
        'Closed': 'closed'
      };

onStatusChange(draggedDeal.Id, statusMap[stageKey], stageKey);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-full overflow-hidden">
      {/* Pipeline Overview */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGES.map(stage => (
            <Card key={stage.key} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-sm text-slate-500">
                  {stageData[stage.key].count}
                </span>
              </div>
              <div className="text-lg font-bold text-slate-900">
                {formatCurrency(stageData[stage.key].total)}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 h-full overflow-x-auto pb-6">
        {STAGES.map(stage => (
          <div
            key={stage.key}
            className="flex-shrink-0 w-72"
          >
            {/* Column Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-sm text-slate-500">
                    {stageData[stage.key].count}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-700">
                  {formatCurrency(stageData[stage.key].total)}
                </div>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              className={`min-h-96 p-2 rounded-lg transition-colors ${
                dragOverStage === stage.key
                  ? 'bg-blue-50 border-2 border-blue-200 border-dashed'
                  : 'bg-slate-50 border-2 border-transparent'
              }`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              {/* Deal Cards */}
              <div className="space-y-3">
                {stageData[stage.key].deals.map(deal => (
                  <DealCard
key={deal.Id}
                    deal={deal}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedDeal?.Id === deal.Id}
                  />
                ))}
              </div>

              {/* Empty State */}
              {stageData[stage.key].deals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <ApperIcon name="Inbox" className="h-8 w-8 mb-2" />
                  <p className="text-sm">No deals in {stage.label}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealKanbanBoard;