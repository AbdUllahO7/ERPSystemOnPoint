import { useState, useEffect } from "react";
import { Mail, Phone, PhoneCall, Trash2, User, Plus, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getSupplierContactsBySupplierId, 
  createSupplierContact, 
  updateSupplierContact,
  toggleSupplierContactStatus,
  getSupplierContactById
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ContactsTab({ supplierId }) {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [editContactId, setEditContactId] = useState(null);

  const [formData, setFormData] = useState({
    contact_Name: "",
    role: "",
    contact_Email: "",
    contact_Phone: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["supplierContacts", supplierId],
    queryFn: () => getSupplierContactsBySupplierId(supplierId),
    enabled: !!supplierId,
  });

  const { data: editContactData, isFetching: isFetchingEditContact } = useQuery({
    queryKey: ["supplierContact", editContactId],
    queryFn: () => getSupplierContactById(editContactId),
    enabled: !!editContactId,
  });

  useEffect(() => {
    if (editContactId && editContactData?.data) {
      const contact = editContactData.data;
      setFormData({
        contact_Name: contact.name || "",
        role: contact.role || "Management",
        contact_Email: contact.email || "",
        contact_Phone: contact.phone || "",
      });
      setIsAddModalOpen(true);
    }
  }, [editContactData, editContactId]);

  const addMutation = useMutation({
    mutationFn: (newContact) => createSupplierContact(newContact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierContacts", supplierId] });
      toast.success("Contact added successfully");
      closeModal();
    },
    onError: () => {
      toast.error("Failed to add contact");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updatedContact) => updateSupplierContact(updatedContact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierContacts", supplierId] });
      toast.success("Contact updated successfully");
      closeModal();
    },
    onError: () => {
      toast.error("Failed to update contact");
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (contactId) => toggleSupplierContactStatus(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierContacts", supplierId] });
      toast.success("Contact deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete contact");
    }
  });

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditContactId(null);
    setFormData({ contact_Name: "", role: "", contact_Email: "", contact_Phone: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Supplier ID is missing");
      return;
    }
    
    if (editContactId) {
      updateMutation.mutate({
        id: editContactId,
        supplierId: supplierId,
        name: formData.contact_Name,
        role: formData.role || "Management",
        email: formData.contact_Email,
        phone: formData.contact_Phone,
      });
    } else {
      addMutation.mutate({
        supplierId: supplierId,
        name: formData.contact_Name,
        role: formData.role || "Management",
        email: formData.contact_Email,
        phone: formData.contact_Phone,
      });
    }
  };

  const handleDelete = () => {
    if (selectedContactId) {
      toggleStatusMutation.mutate(selectedContactId);
    }
  };

  const contacts = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          if (!open) closeModal();
          else setIsAddModalOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditContactId(null)}>
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
                <DialogTitle className="text-xl font-semibold">
                  {editContactId ? "Edit Contact" : "Add new Contact"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 pt-6">
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
                <Button 
                  type="submit" 
                  className="w-full bg-[#006fee] hover:bg-[#005bc4] text-white h-11 text-base font-medium" 
                  disabled={addMutation.isPending || updateMutation.isPending || isFetchingEditContact}
                >
                  {addMutation.isPending || updateMutation.isPending 
                    ? "Saving..." 
                    : isFetchingEditContact ? "Loading..." : "Save"}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div className="text-center py-4">Loading contacts...</div>}
      {isError && <div className="text-center py-4 text-red-500">Error loading contacts</div>}
      {!isLoading && !isError && contacts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No contacts found.</div>
      )}

      {contacts.filter(c => c.isActive).map((contact) => (
        <div key={contact.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{contact.name}</div>
              <div className="text-xs text-muted-foreground">{contact.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Email</div>
                <div className="text-sm font-medium">{contact.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-xs font-semibold text-muted-foreground">Phone Number</div>
                <div className="text-sm font-medium">{contact.phone}</div>
              </div>
            </div>

            <div className="flex items-center ml-4 gap-2">
              <button 
                onClick={() => setEditContactId(contact.id)}
                className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                title="Edit Contact"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  setSelectedContactId(contact.id);
                  setDeleteModalOpen(true);
                }}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title="Delete Contact"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Contact"
        description="Are you sure you want to delete this contact? This action cannot be undone."
      />
    </div>
  );
}
