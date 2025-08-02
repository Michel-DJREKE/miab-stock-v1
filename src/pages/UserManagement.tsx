import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Edit,
  Shield,
  Users,
  UserCog,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { useRoles, AppRole } from "@/hooks/useRoles";
import { UserManagementModal } from "@/components/UserManagementModal";
import { RolePermissionsDisplay } from "@/components/RolePermissionsDisplay";
import { toast } from "sonner";

export default function UserManagement() {
  const { currentUserRole, shopUsers, isLoadingUsers, deleteUser, userShop } =
    useRoles();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"invite" | "edit">("invite");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const roleLabels: Record<AppRole, string> = {
    admin: "Administrateur",
    manager: "Gérant",
    accountant: "Comptable",
    sales: "Commercial",
  };

  const roleColors: Record<AppRole, string> = {
    admin: "bg-red-500",
    manager: "bg-blue-500",
    accountant: "bg-green-500",
    sales: "bg-orange-500",
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "expired":
      case "used":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const handleInviteUser = () => {
    setModalMode("invite");
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setModalMode("edit");
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    // Ne pas permettre la suppression du propriétaire
    if (userShop?.shop.owner_id === user.id) {
      toast.error("Impossible de supprimer le propriétaire de la boutique");
      return;
    }

    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success("Utilisateur supprimé avec succès !");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const isOwner = (userId: string) => {
    return userShop?.shop.owner_id === userId;
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les utilisateurs et leurs rôles dans votre boutique
          </p>
        </div>

        <Button onClick={handleInviteUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          Inviter un utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Utilisateurs de la boutique ({shopUsers?.length || 0})
              </CardTitle>
              <CardDescription>
                Liste des utilisateurs avec leurs rôles et permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date d'ajout</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shopUsers?.filter(user => user?.id && user?.email)
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{user.email}</p>
                                {isOwner(user.id) && (
                                  <Badge variant="outline" className="text-xs">
                                    Propriétaire
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`${roleColors[user.role]} text-white`}
                            >
                              {roleLabels[user.role] ?? user.role}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(user.status)}
                              <span className="capitalize text-sm">
                                {user.status === "active"
                                  ? "Actif"
                                  : user.status === "pending"
                                  ? "En attente"
                                  : user.status === "expired"
                                  ? "Expiré"
                                  : user.status === "used"
                                  ? "Utilisé"
                                  : user.status}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString(
                                  "fr-FR"
                                )
                              : "—"}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.status === "active" &&
                                !isOwner(user.id) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              {!isOwner(user.id) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {(!shopUsers || shopUsers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <p className="text-muted-foreground">
                            Aucun utilisateur trouvé
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Role Permissions Display */}
        <div className="space-y-4">
          {currentUserRole && (
            <RolePermissionsDisplay role={currentUserRole.role} />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hiérarchie des rôles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white">Administrateur</Badge>
                <span className="text-sm text-muted-foreground">
                  Accès complet
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">Gérant</Badge>
                <span className="text-sm text-muted-foreground">
                  Gestion opérationnelle
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">Comptable</Badge>
                <span className="text-sm text-muted-foreground">
                  Consultation et analyses
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500 text-white">Commercial</Badge>
                <span className="text-sm text-muted-foreground">
                  Ventes et produits
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        user={selectedUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {userToDelete?.email} ?
              {userToDelete?.status === "active"
                ? " Cet utilisateur perdra l'accès à la boutique."
                : " Cette invitation sera annulée."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
