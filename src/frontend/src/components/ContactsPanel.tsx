import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Phone, Plus, Trash2, UserCircle, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddContact,
  useContacts,
  useDeleteContact,
} from "../hooks/useQueries";

export default function ContactsPanel() {
  const { data: contacts, isLoading } = useContacts();
  const addContact = useAddContact();
  const deleteContact = useDeleteContact();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("NAME REQUIRED");
      return;
    }
    if (!phone.trim()) {
      toast.error("PHONE REQUIRED");
      return;
    }
    try {
      await addContact.mutateAsync({
        name: name.trim(),
        phoneNumber: phone.trim(),
        relationship: relationship.trim() || "CONTACT",
      });
      toast.success(`CONTACT ADDED: ${name.trim()}`);
      setName("");
      setPhone("");
      setRelationship("");
      setFormOpen(false);
    } catch {
      toast.error("ADD FAILED — retry");
    }
  };

  const handleDelete = async (contactName: string) => {
    try {
      await deleteContact.mutateAsync(contactName);
      toast.success(`CONTACT REMOVED: ${contactName}`);
    } catch {
      toast.error("DELETE FAILED");
    }
  };

  return (
    <div className="p-2 space-y-2" data-ocid="contact.list">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-1.5 border-b border-border/50">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Emergency Contacts
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] font-mono uppercase tracking-wider hover:bg-secondary hover:text-primary px-2"
          onClick={() => setFormOpen((v) => !v)}
          data-ocid="contact.add_button"
        >
          <Plus className="h-3 w-3 mr-1" />
          ADD
        </Button>
      </div>

      {/* Add Contact Form */}
      {formOpen && (
        <form
          onSubmit={handleAdd}
          className="p-2 border border-primary/30 rounded-sm bg-card/60 space-y-2"
          data-ocid="contact.panel"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1 h-1 bg-primary rounded-full" />
            <span className="font-mono text-[10px] text-primary uppercase tracking-widest">
              NEW CONTACT
            </span>
          </div>

          <div className="space-y-1">
            <Label className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
              Full Name *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="CONTACT NAME"
              className="h-7 font-mono text-xs bg-secondary border-border focus-visible:ring-primary placeholder:text-muted-foreground/40 uppercase"
              maxLength={50}
              data-ocid="contact.input"
            />
          </div>

          <div className="space-y-1">
            <Label className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
              Phone *
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="h-7 font-mono text-xs bg-secondary border-border focus-visible:ring-primary placeholder:text-muted-foreground/40"
              maxLength={20}
              type="tel"
            />
          </div>

          <div className="space-y-1">
            <Label className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
              Role / Relationship
            </Label>
            <Input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="FAMILY / COMMAND / MEDIC"
              className="h-7 font-mono text-xs bg-secondary border-border focus-visible:ring-primary placeholder:text-muted-foreground/40 uppercase"
              maxLength={30}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 h-7 font-mono text-[10px] uppercase tracking-wider border-border hover:bg-secondary"
              onClick={() => setFormOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={addContact.isPending}
              className="flex-1 h-7 font-mono text-[10px] uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/80"
              data-ocid="contact.submit_button"
            >
              {addContact.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  SAVING...
                </>
              ) : (
                "SAVE"
              )}
            </Button>
          </div>
        </form>
      )}

      <Separator className="bg-border/50" />

      {/* Loading */}
      {isLoading && (
        <div className="space-y-1">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full bg-secondary/60" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!contacts || contacts.length === 0) && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-7 w-7 text-muted-foreground/30 mb-2" />
          <p className="font-mono text-[11px] text-muted-foreground uppercase">
            No contacts saved
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
            Add emergency contacts above
          </p>
        </div>
      )}

      {/* Contact list */}
      {contacts?.map((contact, i) => (
        <div
          key={contact.name}
          data-ocid={`contact.item.${i + 1}`}
          className="group flex items-center gap-2 p-2 rounded-sm border border-border/30 bg-card/50 hover:bg-secondary/40 transition-colors"
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-sm bg-secondary flex items-center justify-center">
            <UserCircle className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs text-foreground font-bold uppercase truncate">
              {contact.name}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="h-2.5 w-2.5 text-muted-foreground/60 flex-shrink-0" />
              <span className="font-mono text-[10px] text-primary">
                {contact.phoneNumber}
              </span>
            </div>
            <div className="font-mono text-[9px] text-muted-foreground/60 uppercase mt-0.5">
              {contact.relationship}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0 hover:bg-destructive/20 hover:text-destructive transition-all"
            onClick={() => handleDelete(contact.name)}
            disabled={deleteContact.isPending}
            data-ocid={`contact.delete_button.${i + 1}`}
            aria-label={`Delete ${contact.name}`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
