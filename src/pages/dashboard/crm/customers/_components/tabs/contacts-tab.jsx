import { useState } from "react";
import { Mail, Phone, Trash2, User, Plus, PhoneCall } from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerContacts, createCustomerContact, deleteCustomerContact } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";

export function ContactsTab() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    contact_Name: "",
    role: "",
    contact_Email: "",
    contact_Phone: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["customerContacts", id],
    queryFn: () => getCustomerContacts({
      customerId: id,
      pageNumber: 1,
      pageSize: 100,
    }),
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: createCustomerContact,
    onSuccess: () => {
      toast.success("Contact added successfully");
      queryClient.invalidateQueries(["customerContacts"]);
      setIsAddModalOpen(false);
      setFormData({ contact_Name: "", role: "", contact_Email: "", contact_Phone: "" });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to add contact");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomerContact,
    onSuccess: () => {
      toast.success("Contact deleted successfully");
      queryClient.invalidateQueries(["customerContacts"]);
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete contact");
      setDeleteId(null);
    },
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!id) {
      toast.error("Customer ID is missing. Please save the customer first.");
      return;
    }
    addMutation.mutate({
      customer_id: id,
      ...formData
    });
  };

  const contacts = data?.data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add new Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 border-0 rounded-2xl overflow-hidden">
            <div className="p-6">
              <DialogHeader className="flex flex-row items-center gap-4 space-y-0 border-b pb-6">
                <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-gray-500" />
                </div>
                <DialogTitle className="text-xl font-semibold">Add new Contact</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAddSubmit} className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Name</Label>
                    <Input
                      placeholder="name"
                      value={formData.contact_Name}
                      onChange={(e) => setFormData({ ...formData, contact_Name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Role/Agency</Label>
                    <Input
                      placeholder="Role/Agency"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">E-mail</Label>
                    <Input
                      type="email"
                      placeholder="e-mail"
                      value={formData.contact_Email}
                      onChange={(e) => setFormData({ ...formData, contact_Email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Phone</Label>
                    <Input
                      placeholder="phone"
                      value={formData.contact_Phone}
                      onChange={(e) => setFormData({ ...formData, contact_Phone: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#006fee] hover:bg-[#005bc4] text-white h-11 text-base font-medium" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Add"}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground border rounded-xl bg-card">No contacts found</div>
      ) : (
        contacts.map((contact) => (
          <div key={contact.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-foreground">{contact.contactName || contact.name}</div>
                <div className="text-xs text-muted-foreground">{contact.role || contact.title}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-12 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">Email</div>
                  <div className="text-sm font-medium">{contact.contactEmail || contact.email || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground">Phone Number</div>
                  <div className="text-sm font-medium">{contact.contactPhone || contact.phone || "N/A"}</div>
                </div>
              </div>

              <button 
                onClick={() => setDeleteId(contact.id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors sm:ml-4"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      )}

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Contact"
        description="Are you sure you want to delete this contact? This action cannot be undone."
      />
    </div>
  );
}
