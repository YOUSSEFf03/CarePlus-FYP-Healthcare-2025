import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button/Button";
import CustomText from "../../components/Text/CustomText";
import CustomInput from "../../components/Inputs/CustomInput";
import DeleteConfirmationModal from "../../components/Workplace/DeleteConfirmationModal";
import "../../styles/doctorAssistants.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

interface Assistant {
  id: string;
  assistantId: string;
  doctorWorkplaceId: string;
  inviteId: string;
  status: 'active' | 'inactive';
  assigned_at: string;
  userInfo: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profile_picture_url?: string;
  };
  workplaceInfo?: {
    id: string;
    workplace_name: string;
    workplace_type: string;
  };
}

interface AssistantInvite {
  id: string;
  assistantEmail: string;
  workplaceId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  workplaceInfo?: {
    id: string;
    workplace_name: string;
    workplace_type: string;
  };
}

// Fetch all assistants for the doctor
const fetchMyAssistants = async (): Promise<Assistant[]> => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.get(
      `${API_BASE}/assistants/doctor/my-assistants`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || "Failed to fetch assistants");
    }
  } catch (error: any) {
    console.error("Error fetching assistants:", error.response?.status, error.response?.data);
    throw error;
  }
};

// Fetch pending invites
const fetchPendingInvites = async (): Promise<AssistantInvite[]> => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.get(
      `${API_BASE}/assistants/doctor/pending-invites`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || "Failed to fetch pending invites");
    }
  } catch (error: any) {
    console.error("Error fetching pending invites:", error.response?.status, error.response?.data);
    return []; // Return empty array if no invites endpoint exists
  }
};

// Remove assistant from workplace
const removeAssistant = async (assistantId: string, workplaceId: string, reason?: string): Promise<void> => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.delete(
      `${API_BASE}/doctors/workplaces/${workplaceId}/assistants/${assistantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { reason },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to remove assistant");
    }
  } catch (error: any) {
    console.error("Error removing assistant:", error.response?.status, error.response?.data);
    throw error;
  }
};

// Cancel pending invite
const cancelInvite = async (inviteId: string): Promise<void> => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.delete(
      `${API_BASE}/assistants/doctor/invites/${inviteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to cancel invite");
    }
  } catch (error: any) {
    console.error("Error canceling invite:", error.response?.status, error.response?.data);
    throw error;
  }
};

export default function DoctorAssistants() {
  const { isAuthenticated } = useAuth();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [pendingInvites, setPendingInvites] = useState<AssistantInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Delete confirmation states
  const [showDeleteAssistant, setShowDeleteAssistant] = useState<{
    assistant: Assistant;
  } | null>(null);
  const [showCancelInvite, setShowCancelInvite] = useState<{
    invite: AssistantInvite;
  } | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const [assistantsData, invitesData] = await Promise.all([
          fetchMyAssistants(),
          fetchPendingInvites(),
        ]);

        setAssistants(assistantsData);
        setPendingInvites(invitesData);
      } catch (err: any) {
        console.error("Error loading assistants data:", err);
        setError(err.message || "Failed to load assistants data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Filter and search assistants
  const filteredAssistants = useMemo(() => {
    let filtered = assistants;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(assistant => assistant.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(assistant =>
        assistant.userInfo.name.toLowerCase().includes(term) ||
        assistant.userInfo.email.toLowerCase().includes(term) ||
        assistant.workplaceInfo?.workplace_name.toLowerCase().includes(term) ||
        assistant.workplaceInfo?.workplace_type.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [assistants, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAssistants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssistants = filteredAssistants.slice(startIndex, startIndex + itemsPerPage);

  // Handle remove assistant
  const handleRemoveAssistant = async () => {
    if (!showDeleteAssistant) return;

    setSaving(true);
    setError(null);

    try {
      await removeAssistant(
        showDeleteAssistant.assistant.assistantId,
        showDeleteAssistant.assistant.doctorWorkplaceId,
        "Removed by doctor"
      );

      // Remove from local state
      setAssistants(prev =>
        prev.filter(a => a.id !== showDeleteAssistant.assistant.id)
      );

      setShowDeleteAssistant(null);
    } catch (err: any) {
      console.error("Error removing assistant:", err);
      setError(err.message || "Failed to remove assistant");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel invite
  const handleCancelInvite = async () => {
    if (!showCancelInvite) return;

    setSaving(true);
    setError(null);

    try {
      await cancelInvite(showCancelInvite.invite.id);

      // Remove from local state
      setPendingInvites(prev =>
        prev.filter(invite => invite.id !== showCancelInvite.invite.id)
      );

      setShowCancelInvite(null);
    } catch (err: any) {
      console.error("Error canceling invite:", err);
      setError(err.message || "Failed to cancel invite");
    } finally {
      setSaving(false);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-badge status-active';
      case 'inactive':
        return 'status-badge status-inactive';
      case 'pending':
        return 'status-badge status-pending';
      default:
        return 'status-badge status-unknown';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="assistants-container">
        <div className="assistants-loading">
          <div className="loading-spinner"></div>
          <span>Loading assistants...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="assistants-container">
      <div className="assistants-header">
        <div className="assistants-title">
          <CustomText variant="text-heading-H2" as="h2">Your Assistants</CustomText>
          <p>Manage assistants across all your workplaces</p>
        </div>
        <div className="assistants-stats">
          <div className="stat-card">
            <span className="stat-number">{assistants.length}</span>
            <span className="stat-label">Total Assistants</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{assistants.filter(a => a.status === 'active').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{pendingInvites.length}</span>
            <span className="stat-label">Pending Invites</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="assistants-error">
          <span>⚠️ {error}</span>
          <Button
            text="Retry"
            variant="secondary"
            onClick={() => window.location.reload()}
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="assistants-controls">
        <div className="search-section">
          <CustomInput
            placeholder="Search assistants by name, email, or workplace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </div>
        <div className="filter-section">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <div className="pending-invites-section">
          <h3>Pending Invitations ({pendingInvites.length})</h3>
          <div className="invites-table">
            <div className="invites-header">
              <div className="invite-col-email">Email</div>
              <div className="invite-col-workplace">Workplace</div>
              <div className="invite-col-date">Invited</div>
              <div className="invite-col-actions">Actions</div>
            </div>
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="invite-row">
                <div className="invite-col-email">
                  <span className="invite-email">{invite.assistantEmail}</span>
                </div>
                <div className="invite-col-workplace">
                  <span className="invite-workplace">
                    {invite.workplaceInfo?.workplace_name || 'Unknown Workplace'}
                  </span>
                  <span className="invite-workplace-type">
                    {invite.workplaceInfo?.workplace_type || 'Unknown Type'}
                  </span>
                </div>
                <div className="invite-col-date">
                  {new Date(invite.created_at).toLocaleDateString()}
                </div>
                <div className="invite-col-actions">
                  <Button
                    text="Cancel"
                    variant="tertiary"
                    className="btn-danger"
                    onClick={() => setShowCancelInvite({ invite })}
                    disabled={saving}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assistants Table */}
      <div className="assistants-table-section">
        <div className="table-header">
          <h3>Active Assistants ({filteredAssistants.length})</h3>
        </div>
        
        {filteredAssistants.length === 0 ? (
          <div className="assistants-empty">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h4>No assistants found</h4>
            <p>
              {searchTerm || statusFilter !== "all"
                ? "No assistants match your current filters."
                : "You haven't invited any assistants yet."}
            </p>
          </div>
        ) : (
          <>
            <div className="assistants-table">
              <div className="table-header-row">
                <div className="col-name">Name</div>
                <div className="col-email">Email</div>
                <div className="col-phone">Phone</div>
                <div className="col-workplace">Workplace</div>
                <div className="col-status">Status</div>
                <div className="col-assigned">Assigned</div>
                <div className="col-actions">Actions</div>
              </div>
              
              {paginatedAssistants.map((assistant) => (
                <div key={assistant.id} className="table-row">
                  <div className="col-name">
                    <div className="assistant-avatar">
                      {assistant.userInfo.profile_picture_url ? (
                        <img
                          src={assistant.userInfo.profile_picture_url}
                          alt={assistant.userInfo.name}
                        />
                      ) : (
                        <span>{assistant.userInfo.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="assistant-name">{assistant.userInfo.name}</span>
                  </div>
                  <div className="col-email">
                    <span className="assistant-email">{assistant.userInfo.email}</span>
                  </div>
                  <div className="col-phone">
                    <span className="assistant-phone">
                      {assistant.userInfo.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="col-workplace">
                    <span className="workplace-name">
                      {assistant.workplaceInfo?.workplace_name || "Unknown Workplace"}
                    </span>
                    <span className="workplace-type">
                      {assistant.workplaceInfo?.workplace_type || "Unknown Type"}
                    </span>
                  </div>
                  <div className="col-status">
                    <span className={getStatusBadgeClass(assistant.status)}>
                      {getStatusLabel(assistant.status)}
                    </span>
                  </div>
                  <div className="col-assigned">
                    {new Date(assistant.assigned_at).toLocaleDateString()}
                  </div>
                  <div className="col-actions">
                    <Button
                      text="Remove"
                      variant="tertiary"
                      className="btn-danger"
                      onClick={() => setShowDeleteAssistant({ assistant })}
                      disabled={saving}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="assistants-pagination">
                <Button
                  text="Previous"
                  variant="secondary"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  text="Next"
                  variant="secondary"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modals */}
      {showDeleteAssistant && (
        <DeleteConfirmationModal
          name={showDeleteAssistant.assistant.userInfo.name}
          onCancel={() => setShowDeleteAssistant(null)}
          onConfirm={handleRemoveAssistant}
        />
      )}

      {showCancelInvite && (
        <DeleteConfirmationModal
          name={`invitation to ${showCancelInvite.invite.assistantEmail}`}
          onCancel={() => setShowCancelInvite(null)}
          onConfirm={handleCancelInvite}
        />
      )}
    </div>
  );
}
