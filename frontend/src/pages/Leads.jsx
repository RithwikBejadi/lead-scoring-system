import React, { useState, useMemo } from "react";
import LeadsHeader from "../components/leads/LeadsHeader";
import FilterBar from "../components/leads/FilterBar";
import LeadsTable from "../components/leads/LeadsTable";
import IntelligenceDrawer from "../components/leads/IntelligenceDrawer";
import PaginationFooter from "../components/leads/PaginationFooter";

const Leads = ({ leads = [], leadsLoading, onRefresh }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  // Filter leads by search query and stage
  const filteredLeads = useMemo(() => {
    let result = leads;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((lead) => {
        const name = (lead.name || "").toLowerCase();
        const email = (lead.email || "").toLowerCase();
        const anonId = (lead.anonymousId || "").toLowerCase();
        return name.includes(q) || email.includes(q) || anonId.includes(q);
      });
    }

    if (stageFilter !== "all") {
      result = result.filter((lead) => {
        const score = lead.currentScore || 0;
        switch (stageFilter) {
          case "qualified":
            return score >= 85;
          case "hot":
            return score >= 70 && score < 85;
          case "warm":
            return score >= 40 && score < 70;
          case "cold":
            return score < 40;
          default:
            return true;
        }
      });
    }

    return result;
  }, [leads, searchQuery, stageFilter]);

  const handleSelectLead = (lead) => setSelectedLead(lead);
  const handleCloseDrawer = () => setSelectedLead(null);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <LeadsHeader
        onRefresh={onRefresh}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />
      <FilterBar
        stageFilter={stageFilter}
        onStageChange={setStageFilter}
        totalCount={leads.length}
        filteredCount={filteredLeads.length}
      />

      {leadsLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-text-secondary-light dark:text-text-secondary-dark">
            <span className="material-icons text-4xl mb-2 animate-spin">
              sync
            </span>
            <p className="text-sm">Loading leads...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          <LeadsTable
            leads={filteredLeads}
            onSelectLead={handleSelectLead}
            selectedLeadId={selectedLead?._id}
          />
          <IntelligenceDrawer
            open={!!selectedLead}
            lead={selectedLead}
            onClose={handleCloseDrawer}
          />
        </div>
      )}

      <PaginationFooter totalLeads={filteredLeads.length} />
    </div>
  );
};

export default Leads;
