import React, { useState } from "react";
import { useRestockings } from "@/hooks/useRestockings";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProducts } from "@/hooks/useProducts";
import { useActionHistory } from "@/hooks/useActionHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Package,
  Eye,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import RestockingForm from "@/components/RestockingForm";

const Restocking = () => {
  const {
    restockings,
    isLoading,
    createRestocking,
    updateRestocking,
    deleteRestocking,
  } = useRestockings();
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const { logAction } = useActionHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRestocking, setSelectedRestocking] = useState<any>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );

  const filteredRestockings = restockings.filter((restocking) => {
    const supplier = suppliers.find((s) => s.id === restocking.supplier_id);
    const matchesSearch =
      restocking.reference_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || restocking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNewRestocking = () => {
    setSelectedRestocking(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleViewRestocking = (restocking: any) => {
    setSelectedRestocking(restocking);
    setFormMode("view");
    setIsFormOpen(true);
  };

  const handleEditRestocking = (restocking: any) => {
    if (restocking.status === "completed") {
      toast.error("Impossible de modifier un réapprovisionnement terminé");
      return;
    }
    setSelectedRestocking(restocking);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDeleteRestocking = async (restockingId: string) => {
    const restocking = restockings.find((r) => r.id === restockingId);
    if (restocking?.status === "completed") {
      toast.error("Impossible de supprimer un réapprovisionnement terminé");
      return;
    }

    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce réapprovisionnement ?"
      )
    ) {
      try {
        await deleteRestocking.mutateAsync(restockingId);
        await logAction.mutateAsync({
          action_type: "delete",
          entity_type: "restocking",
          entity_id: restockingId,
          entity_name: restocking?.reference_number || "Réapprovisionnement",
          description: `Suppression du réapprovisionnement ${restocking?.reference_number}`,
        });
      } catch (error) {
        console.error("Error deleting restocking:", error);
      }
    }
  };

  const handleStatusChange = async (
    restockingId: string,
    newStatus: string
  ) => {
    const restocking = restockings.find((r) => r.id === restockingId);
    if (!restocking) return;

    try {
      if (newStatus === "cancelled") {
        await deleteRestocking.mutateAsync(restockingId);
        await logAction.mutateAsync({
          action_type: "delete",
          entity_type: "restocking",
          entity_id: restockingId,
          entity_name: restocking.reference_number || "Réapprovisionnement",
          description: `Annulation du réapprovisionnement ${restocking.reference_number}`,
        });
      } else {
        await updateRestocking.mutateAsync({
          id: restockingId,
          restocking: {
            status: newStatus,
          },
        });

        await logAction.mutateAsync({
          action_type: "update",
          entity_type: "restocking",
          entity_id: restockingId,
          entity_name: restocking.reference_number || "Réapprovisionnement",
          description: `Changement de statut vers ${newStatus}`,
          old_data: { status: restocking.status },
          new_data: { status: newStatus },
        });
      }
    } catch (error) {
      console.error("Error updating restocking status:", error);
    }
  };

  const handleSaveRestocking = async (restockingData: any) => {
    try {
      if (formMode === "create") {
        const newRestocking = await createRestocking.mutateAsync(
          restockingData
        );
        await logAction.mutateAsync({
          action_type: "create",
          entity_type: "restocking",
          entity_id: newRestocking.id,
          entity_name: newRestocking.reference_number || "Réapprovisionnement",
          description: `Création du réapprovisionnement ${newRestocking.reference_number}`,
          new_data: restockingData,
        });
      } else if (formMode === "edit") {
        await updateRestocking.mutateAsync({
          id: selectedRestocking.id,
          ...restockingData,
        });
        await logAction.mutateAsync({
          action_type: "update",
          entity_type: "restocking",
          entity_id: selectedRestocking.id,
          entity_name:
            selectedRestocking.reference_number || "Réapprovisionnement",
          description: `Modification du réapprovisionnement ${selectedRestocking.reference_number}`,
          old_data: selectedRestocking,
          new_data: restockingData,
        });
      }
      setIsFormOpen(false);
      setSelectedRestocking(null);
    } catch (error) {
      console.error("Error saving restocking:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Terminé
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Annulé
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier?.name || "Fournisseur inconnu";
  };

  const getRestockingItemsCount = (restocking: any) => {
    return restocking.restocking_items?.length || 0;
  };

  const stats = {
    totalRestockings: restockings.length,
    pendingRestockings: restockings.filter((r) => r.status === "pending")
      .length,
    completedRestockings: restockings.filter((r) => r.status === "completed")
      .length,
    totalValue: restockings.reduce((sum, r) => sum + (r.total_amount || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">
              Chargement des réapprovisionnements...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Réapprovisionnements
          </h1>
          <p className="text-muted-foreground">
            Gérez vos réapprovisionnements
          </p>
        </div>
        <Button onClick={handleNewRestocking}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau réapprovisionnement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {stats.totalRestockings}
              </p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pendingRestockings}
              </p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.completedRestockings}
              </p>
              <p className="text-sm text-muted-foreground">Terminés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {stats.totalValue.toLocaleString()} F
              </p>
              <p className="text-sm text-muted-foreground">Valeur totale</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un réapprovisionnement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restockings List */}
      <div className="space-y-4">
        {filteredRestockings.map((restocking) => (
          <Card key={restocking.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-foreground">
                        {restocking.reference_number ||
                          `RÉA-${restocking.id.slice(0, 8)}`}
                      </h3>
                      {getStatusBadge(restocking.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Truck className="w-4 h-4" />
                        <span>{getSupplierName(restocking.supplier_id)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Hash className="w-4 h-4" />
                        <span>
                          {getRestockingItemsCount(restocking)} articles
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(restocking.created_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {(restocking.total_amount || 0).toLocaleString()} F CFA
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(restocking.created_at).toLocaleTimeString(
                        "fr-FR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewRestocking(restocking)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {restocking.status !== "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRestocking(restocking)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {restocking.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600"
                          onClick={() =>
                            handleStatusChange(restocking.id, "completed")
                          }
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() =>
                            handleStatusChange(restocking.id, "cancelled")
                          }
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {restocking.status !== "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDeleteRestocking(restocking.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRestockings.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm || statusFilter !== "all"
                  ? "Aucun réapprovisionnement trouvé"
                  : "Aucun réapprovisionnement"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Aucun réapprovisionnement ne correspond à vos critères."
                  : "Commencez par créer votre premier réapprovisionnement."}
              </p>
              <Button onClick={handleNewRestocking}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau réapprovisionnement
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Restocking Form Modal */}
      <RestockingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveRestocking}
        restocking={selectedRestocking}
        mode={formMode}
      />
    </div>
  );
};

export default Restocking;
