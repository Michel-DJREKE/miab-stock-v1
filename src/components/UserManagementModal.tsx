
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRoles, AppRole } from '@/hooks/useRoles';
import { toast } from 'sonner';

const inviteUserSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  role: z.enum(['admin', 'manager', 'accountant', 'sales'] as const),
});

type InviteUserForm = z.infer<typeof inviteUserSchema>;

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'invite' | 'edit';
  user?: any;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  mode,
  user
}) => {
  const { inviteUser, updateUserRole } = useRoles();

  const form = useForm<InviteUserForm>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      role: user?.role || 'sales',
    },
  });

  React.useEffect(() => {
    if (user && mode === 'edit') {
      form.reset({
        email: user.email || '',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        role: user.role || 'sales',
      });
    } else if (mode === 'invite') {
      form.reset({
        email: '',
        firstName: '',
        lastName: '',
        role: 'sales',
      });
    }
  }, [user, mode, form]);

  const onSubmit = async (data: InviteUserForm) => {
    try {
      if (mode === 'invite') {
        await inviteUser.mutateAsync({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role
        });
        toast.success('Invitation envoyée avec succès !');
      } else if (mode === 'edit' && user) {
        await updateUserRole.mutateAsync({
          userId: user.id,
          newRole: data.role
        });
        toast.success('Rôle utilisateur mis à jour !');
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error in user management:', error);
      toast.error('Une erreur est survenue');
    }
  };

  const roleLabels: Record<AppRole, string> = {
    admin: 'Administrateur',
    manager: 'Gérant',
    accountant: 'Comptable',
    sales: 'Commercial'
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'invite' ? 'Inviter un utilisateur' : 'Modifier l\'utilisateur'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'invite' && (
              <>
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemple.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={inviteUser.isPending || updateUserRole.isPending}
              >
                {inviteUser.isPending || updateUserRole.isPending ? 'Traitement...' : (
                  mode === 'invite' ? 'Inviter' : 'Modifier'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
