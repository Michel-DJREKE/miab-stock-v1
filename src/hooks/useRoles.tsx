import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AppRole = "admin" | "manager" | "accountant" | "sales";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface UserRole {
  id: string;
  role: AppRole;
  user_id: string;
  shop_id: string;
  created_at: string;
}

interface Shop {
  id: string;
  name: string;
  owner_id: string;
  description: string;
}

interface InviteUserResponse {
  success: boolean;
  error?: string;
  invitation_id?: string;
  token?: string;
}

export const useRoles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userShop, isLoading: isLoadingShop } = useQuery({
    queryKey: ["user-shop"],
    queryFn: async () => {
      if (!user) return null;

      // D'abord vérifier si l'utilisateur est propriétaire d'une boutique
      const { data: ownedShop, error: ownedShopError } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (!ownedShopError && ownedShop) {
        // L'utilisateur est propriétaire, retourner avec rôle admin
        return {
          shop: ownedShop as Shop,
          role: "admin" as AppRole,
          isOwner: true,
        };
      }

      // Sinon, vérifier les rôles assignés
      const { data: userRoles, error: userRoleError } = await supabase
        .from("user_shop_roles")
        .select(
          `
    shop_id,
    role,
    shops!inner(id, name, owner_id, description)
  `
        )
        .eq("user_id", user.id);
      if (!user) {
        console.warn("Utilisateur non connecté");
        return null;
      }

      if (userRoleError) {
        console.error("Error fetching user shop:", userRoleError);
        return null;
      }

      if (!userRoles || userRoles.length === 0) {
        console.warn("Aucun rôle trouvé pour cet utilisateur");
        return null;
      }
      const selected = userRoles[0];
      return {
        shop: selected.shops as Shop,
        role: selected.role as AppRole,
        isOwner: false,
      };
    },
    enabled: !!user,
  });

  const { data: currentUserRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      if (!user || !userShop) return null;

      return {
        id: user.id,
        user_id: user.id,
        shop_id: userShop.shop.id,
        role: userShop.role,
        created_at: new Date().toISOString(),
      } as UserRole;
    },
    enabled: !!user && !!userShop,
  });

  // Définition des permissions par rôle - POUR LE MOMENT TOUT EST ACCESSIBLE
  const rolePermissions: Record<AppRole, string[]> = {
    admin: [
      "/dashboard",
      "/products",
      "/sales",
      "/inventory",
      "/restocking",
      "/analytics",
      "/customers",
      "/suppliers",
      "/categories",
      "/users",
      "/settings",
      "/alerts",
      "/history",
    ],
    manager: [
      "/dashboard",
      "/products",
      "/sales",
      "/inventory",
      "/restocking",
      "/customers",
      "/suppliers",
      "/categories",
      "/analytics",
      "/alerts",
      "/history",
      "/users", // Ajouté temporairement
    ],
    accountant: [
      "/dashboard",
      "/products",
      "/sales",
      "/inventory",
      "/analytics",
      "/customers",
      "/suppliers",
      "/users", // Ajouté temporairement
    ],
    sales: [
      "/dashboard",
      "/products",
      "/sales",
      "/categories",
      "/customers",
      "/users", // Ajouté temporairement
    ],
  };

  // Vérifier si l'utilisateur a une permission spécifique - POUR LE MOMENT TOUT EST ACCESSIBLE
  const hasPermission = (resource: string, action: string): boolean => {
    // TEMPORAIREMENT, tous les utilisateurs authentifiés ont toutes les permissions
    return !!user;
  };

  const { data: userPermissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["user-permissions", currentUserRole?.role],
    queryFn: async () => {
      if (!currentUserRole) return [];

      const allowedRoutes = rolePermissions[currentUserRole.role] || [];
      return allowedRoutes.map((route) => ({
        id: route,
        name: route.replace("/", ""),
        description: `Accès à ${route}`,
        resource: route.replace("/", ""),
        action: "read",
      }));
    },
    enabled: !!currentUserRole,
  });

  const { data: shopUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["shop-users", userShop?.shop.id],
    queryFn: async () => {
      if (!userShop?.shop.id) return [];

      const { data, error } = await supabase.rpc(
        "get_shop_users_and_invitations",
        {
          p_shop_id: userShop.shop.id,
        }
      );

      if (error) {
        console.error("Error fetching shop users:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!userShop?.shop.id,
  });

  // Mutation pour inviter un utilisateur
  const inviteUser = useMutation({
    mutationFn: async ({
      email,
      firstName,
      lastName,
      role,
    }: {
      email: string;
      firstName: string;
      lastName: string;
      role: AppRole;
    }) => {
      if (!userShop?.shop.id) {
        throw new Error("Aucune boutique trouvée");
      }

      const { data, error } = await supabase.rpc("invite_user", {
        p_email: email,
        p_first_name: firstName,
        p_last_name: lastName,
        p_role: role,
        p_shop_id: userShop.shop.id,
      });

      if (error) throw error;

      const response = data as unknown as InviteUserResponse;
      if (!response.success) throw new Error(response.error);

      return response;
    },
    onSuccess: () => {
      toast.success("Utilisateur invité avec succès !");
      queryClient.invalidateQueries({ queryKey: ["shop-users"] });
    },
    onError: (error: any) => {
      console.error("Erreur lors de l'invitation:", error);
      toast.error(
        error.message || "Erreur lors de l'invitation de l'utilisateur"
      );
    },
  });

  // Mutation pour mettre à jour le rôle d'un utilisateur
  const updateUserRole = useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: AppRole;
    }) => {
      if (!userShop?.shop.id) {
        throw new Error("Aucune boutique trouvée");
      }

      const { error } = await supabase
        .from("user_shop_roles")
        .update({ role: newRole })
        .eq("user_id", userId)
        .eq("shop_id", userShop.shop.id);

      if (error) throw error;

      return { userId, newRole };
    },
    onSuccess: () => {
      toast.success("Rôle utilisateur mis à jour avec succès !");
      queryClient.invalidateQueries({ queryKey: ["shop-users"] });
    },
    onError: (error: any) => {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour du rôle");
    },
  });

  // Mutation pour supprimer un utilisateur/invitation
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      if (!userShop?.shop.id) {
        throw new Error("Aucune boutique trouvée");
      }

      // Vérifier si c'est une invitation ou un utilisateur
      const user = shopUsers?.find((u) => u.id === userId);
      if (!user) throw new Error("Utilisateur non trouvé");

      if (user.status === "active") {
        // Supprimer l'utilisateur de la boutique
        const { error } = await supabase
          .from("user_shop_roles")
          .delete()
          .eq("user_id", userId)
          .eq("shop_id", userShop.shop.id);

        if (error) throw error;
      } else {
        // Supprimer l'invitation
        const { error } = await supabase
          .from("user_invitations")
          .delete()
          .eq("id", userId);

        if (error) throw error;
      }

      return userId;
    },
    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["shop-users"] });
    },
    onError: (error: any) => {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    },
  });

  // Vérifier si l'utilisateur peut accéder à une route - POUR LE MOMENT TOUT EST ACCESSIBLE
  const canAccess = (route: string): boolean => {
    // TEMPORAIREMENT, tous les utilisateurs authentifiés peuvent accéder à tout
    return !!user;
  };

  return {
    currentUserRole,
    userShop,
    shopUsers,
    userPermissions,
    isLoadingRole: isLoadingRole || isLoadingShop,
    isLoadingPermissions,
    isLoadingUsers,
    canAccess,
    hasPermission,
    inviteUser,
    updateUserRole,
    deleteUser,
  };
};
