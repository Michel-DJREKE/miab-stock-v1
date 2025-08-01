import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActionHistory } from "@/hooks/useActionHistory";
import { toast } from "sonner";

export interface RestockingItem {
  id?: string;
  restocking_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  products?: { name: string; quantity: number } | null;
}

export interface Restocking {
  id: string;
  reference_number?: string;
  supplier_id?: string;
  status: string;
  notes?: string;
  total_amount: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  suppliers?: { name: string } | null;
  restocking_items?: RestockingItem[];
}

export const useRestockings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logAction } = useActionHistory();

  const {
    data: restockings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["restockings"],
    queryFn: async () => {
      if (!user) return [];

      console.log("Fetching restockings...");

      const { data: restockingsData, error: restockingsError } = await supabase
        .from("restockings")
        .select(
          `
        *,
        suppliers!restockings_supplier_id_fkey(id, name),
        restocking_items!fk_restocking_items_restocking(
          *,
          products!fk_restocking_items_product(name, quantity)
        )
      `
        )
        .order("created_at", { ascending: false });

      if (restockingsError) {
        console.error("Restockings query error:", restockingsError);
        throw restockingsError;
      }

      console.log("Fetched restockings:", restockingsData);
      return (restockingsData as unknown as Restocking[]) || [];
    },
    enabled: !!user,
  });

  const createRestocking = useMutation({
    mutationFn: async (restockingData: {
      restocking: Omit<
        Restocking,
        | "id"
        | "user_id"
        | "created_at"
        | "updated_at"
        | "suppliers"
        | "restocking_items"
      >;
      items: Omit<RestockingItem, "id" | "restocking_id" | "products">[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      console.log("Creating restocking with data:", restockingData);

      if (!restockingData.items || restockingData.items.length === 0) {
        throw new Error("Au moins un article est requis");
      }

      const refNumber = `RST-${Date.now()}`;
      const restockingToInsert = {
        supplier_id: restockingData.restocking.supplier_id || null,
        status: restockingData.restocking.status || "pending",
        notes: restockingData.restocking.notes?.trim() || null,
        total_amount: Number(restockingData.restocking.total_amount) || 0,
        reference_number: refNumber,
        user_id: user.id,
      };

      console.log("Inserting restocking:", restockingToInsert);

      const { data: restocking, error: restockingError } = await supabase
        .from("restockings")
        .insert(restockingToInsert)
        .select()
        .single();

      if (restockingError) {
        console.error("Restocking insert error:", restockingError);
        throw restockingError;
      }

      console.log("Restocking created:", restocking);

      const restockingItems = restockingData.items
        .filter(
          (item) => item.product_id && item.quantity > 0 && item.unit_cost >= 0
        )
        .map((item) => ({
          restocking_id: restocking.id,
          product_id: item.product_id,
          quantity: Number(item.quantity),
          unit_cost: Number(item.unit_cost),
          total_cost: Number(item.quantity) * Number(item.unit_cost),
        }));

      if (restockingItems.length === 0) {
        await supabase.from("restockings").delete().eq("id", restocking.id);
        throw new Error("Aucun article valide trouvé");
      }

      console.log("Inserting items:", restockingItems);

      const { error: itemsError } = await supabase
        .from("restocking_items")
        .insert(restockingItems);

      if (itemsError) {
        console.error("Items insert error:", itemsError);
        await supabase.from("restockings").delete().eq("id", restocking.id);
        throw itemsError;
      }

      // Si le statut est 'completed', mettre à jour automatiquement les quantités
      if (restockingData.restocking.status === "completed") {
        console.log("Updating product quantities for completed restocking");
        for (const item of restockingItems) {
          try {
            const { error: updateError } = await supabase.rpc(
              "update_product_quantity",
              {
                product_id: item.product_id,
                quantity_change: Number(item.quantity),
              }
            );

            if (updateError) {
              console.error("Error updating product quantity:", updateError);
              throw new Error(
                `Erreur lors de la mise à jour du stock: ${updateError.message}`
              );
            } else {
              console.log(
                `Updated quantity for product ${item.product_id} by ${item.quantity}`
              );
            }
          } catch (error) {
            console.error("Error in product quantity update:", error);
            throw error;
          }
        }
        toast.success("Stock mis à jour automatiquement !");
      }

      return restocking;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restockings"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      await logAction.mutateAsync({
        action_type: "create",
        entity_type: "restocking",
        entity_id: data.id,
        entity_name: data.reference_number || "Réapprovisionnement",
        description: `Création du réapprovisionnement ${data.reference_number}`,
        new_data: variables,
      });
      toast.success("Réapprovisionnement créé avec succès");
    },
    onError: (error) => {
      console.error("Create restocking error:", error);
      toast.error(`Erreur lors de la création: ${error.message}`);
    },
  });

  const updateRestocking = useMutation({
    // mutationFn: async ({
    //   id,
    //   suppliers,
    //   restocking_items,
    //   ...restockingData
    // }: Partial<Restocking> & { id: string }) => {
    //   console.log("Updating restocking:", id, restockingData);

    //   try {
    //     const { data: currentRestocking, error: fetchError } = await supabase
    //       .from("restockings")
    //       .select("status")
    //       .eq("id", id)
    //       .single();

    //     if (fetchError) {
    //       console.error("Error fetching current restocking:", fetchError);
    //       throw new Error(
    //         `Erreur lors de la récupération: ${fetchError.message}`
    //       );
    //     }

    //     const oldStatus = currentRestocking.status;
    //     const newStatus = restockingData.status;

    //     if (oldStatus === "completed") {
    //       throw new Error(
    //         "Un réapprovisionnement terminé ne peut plus être modifié"
    //       );
    //     }

    //     const { data, error } = await supabase
    //       .from("restockings")
    //       .update(restockingData)
    //       .eq("id", id)
    //       .select()
    //       .single();

    //     if (error) {
    //       console.error("Error updating restocking:", error);
    //       throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    //     }

    //     // Si on passe de pending à completed, mettre à jour les stocks
    //     if (oldStatus === "pending" && newStatus === "completed") {
    //       const { data: currentItems, error: itemsError } = await supabase
    //         .from("restocking_items")
    //         .select("product_id, quantity")
    //         .eq("restocking_id", id);

    //       if (itemsError) {
    //         console.error("Error fetching restocking items:", itemsError);
    //         throw new Error(
    //           `Erreur lors de la récupération des articles: ${itemsError.message}`
    //         );
    //       }

    //       if (currentItems) {
    //         console.log("Validating restocking - adding quantities to stock");
    //         for (const item of currentItems) {
    //           try {
    //             const { error: updateError } = await supabase.rpc(
    //               "update_product_quantity",
    //               {
    //                 product_id: item.product_id,
    //                 quantity_change: Number(item.quantity),
    //               }
    //             );

    //             if (updateError) {
    //               console.error(
    //                 "Error updating product quantity:",
    //                 updateError
    //               );
    //               throw new Error(
    //                 `Erreur lors de la mise à jour du stock pour le produit ${item.product_id}: ${updateError.message}`
    //               );
    //             } else {
    //               console.log(
    //                 `Added ${item.quantity} to product ${item.product_id}`
    //               );
    //             }
    //           } catch (error) {
    //             console.error("Error in product quantity update:", error);
    //             throw error;
    //           }
    //         }
    //         toast.success(
    //           "Réapprovisionnement validé ! Stock mis à jour avec succès !",
    //           {
    //             duration: 5000,
    //           }
    //         );
    //       }
    //     }

    //     return data;
    //   } catch (error) {
    //     console.error("Update restocking error:", error);
    //     throw error;
    //   }
    // },
    mutationFn: async ({
      id,
      restocking,
      items,
    }: {
      id: string;
      restocking: Partial<Restocking>;
      items?: Array<{
        product_id: string;
        quantity: number;
        unit_cost: number;
      }>;
    }) => {
      console.log("Updating restocking:", id, restocking);

      try {
        // 1. Validation du statut
        const { data: currentRestocking, error: fetchError } = await supabase
          .from("restockings")
          .select("status")
          .eq("id", id)
          .single();

        if (fetchError) {
          throw new Error(
            `Erreur lors de la récupération: ${fetchError.message}`
          );
        }

        const oldStatus = currentRestocking.status;
        const newStatus = restocking.status;

        if (oldStatus === "completed") {
          throw new Error(
            "Un réapprovisionnement terminé ne peut plus être modifié"
          );
        }

        // 2. Update du restocking seul
        const { data, error } = await supabase
          .from("restockings")
          .update(restocking) // on n'envoie QUE les vrais champs de la table ici
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
        }

        // 3. Update des items s’il y en a
        if (items && items.length > 0) {
          const { error: deleteError } = await supabase
            .from("restocking_items")
            .delete()
            .eq("restocking_id", id);

          if (deleteError) {
            throw new Error(
              `Erreur lors de la suppression des anciens articles: ${deleteError.message}`
            );
          }

          const { error: insertError } = await supabase
            .from("restocking_items")
            .insert(
              items.map((item) => ({
                restocking_id: id,
                ...item,
                total_cost: item.quantity * item.unit_cost,
              }))
            );

          if (insertError) {
            throw new Error(
              `Erreur lors de l'insertion des nouveaux articles: ${insertError.message}`
            );
          }
        }

        // 4. Update des stocks si changement de statut
        if (oldStatus === "pending" && newStatus === "completed") {
          const { data: currentItems, error: itemsError } = await supabase
            .from("restocking_items")
            .select("product_id, quantity")
            .eq("restocking_id", id);

          if (itemsError) {
            throw new Error(
              `Erreur lors de la récupération des articles: ${itemsError.message}`
            );
          }

          for (const item of currentItems || []) {
            const { error: updateError } = await supabase.rpc(
              "update_product_quantity",
              {
                product_id: item.product_id,
                quantity_change: Number(item.quantity),
              }
            );

            if (updateError) {
              throw new Error(
                `Erreur lors de la mise à jour du stock pour ${item.product_id}: ${updateError.message}`
              );
            }
          }

          toast.success("Réapprovisionnement validé ! Stock mis à jour !");
        }

        return data;
      } catch (error) {
        console.error("Update restocking error:", error);
        throw error;
      }
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restockings"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      const originalRestocking = restockings.find((r) => r.id === variables.id);
      await logAction.mutateAsync({
        action_type: "update",
        entity_type: "restocking",
        entity_id: data.id,
        entity_name: data.reference_number || "Réapprovisionnement",
        description: `Modification du réapprovisionnement ${data.reference_number}`,
        old_data: originalRestocking,
        new_data: variables,
      });
      toast.success("Réapprovisionnement mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Update restocking error:", error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  const deleteRestocking = useMutation({
    mutationFn: async (restockingId: string) => {
      const restocking = restockings.find((r) => r.id === restockingId);
      if (restocking?.status === "completed") {
        throw new Error(
          "Impossible de supprimer un réapprovisionnement terminé"
        );
      }

      const { error } = await supabase
        .from("restockings")
        .delete()
        .eq("id", restockingId);

      if (error) throw error;

      return restockingId;
    },
    onSuccess: async (restockingId) => {
      queryClient.invalidateQueries({ queryKey: ["restockings"] });
      const deletedRestocking = restockings.find((r) => r.id === restockingId);
      await logAction.mutateAsync({
        action_type: "delete",
        entity_type: "restocking",
        entity_id: restockingId,
        entity_name:
          deletedRestocking?.reference_number || "Réapprovisionnement",
        description: `Suppression du réapprovisionnement ${deletedRestocking?.reference_number}`,
        old_data: deletedRestocking,
      });
      toast.success("Réapprovisionnement supprimé avec succès");
    },
    onError: (error) => {
      console.error("Error deleting restocking:", error);
      toast.error(
        error.message || "Erreur lors de la suppression du réapprovisionnement"
      );
    },
  });

  return {
    restockings,
    isLoading,
    error,
    createRestocking,
    updateRestocking,
    deleteRestocking,
  };
};
