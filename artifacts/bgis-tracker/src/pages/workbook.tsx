import { useState } from "react";
import { useProject } from "@/lib/project-context";
import { 
  useListWorkbookItems, 
  useCreateWorkbookItem, 
  useUpdateWorkbookItem, 
  useDeleteWorkbookItem 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit2, Trash2, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WorkbookItem } from "@workspace/api-client-react/src/generated/api.schemas";

const CATEGORIES = [
  "Business Requirements", 
  "Key Stakeholders", 
  "System Dependencies", 
  "Data Migration Notes", 
  "Configuration Decisions"
] as const;

const STATUSES = ["Not Started", "In Progress", "Complete", "Blocked"] as const;

const itemSchema = z.object({
  category: z.enum(CATEGORIES),
  title: z.string().min(2, "Title required"),
  description: z.string().min(1, "Description required"),
  owner: z.string().min(1, "Owner required"),
  status: z.enum(["Complete", "In Progress", "Blocked"]),
  notes: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function Workbook() {
  const { currentProjectId } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: items, isLoading } = useListWorkbookItems(currentProjectId!);
  const { mutate: createItem, isPending: isCreating } = useCreateWorkbookItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateWorkbookItem();
  const { mutate: deleteItem } = useDeleteWorkbookItem();

  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      category: "Business Requirements",
      title: "", description: "", owner: "", status: "In Progress", notes: ""
    }
  });

  const openEdit = (item: WorkbookItem) => {
    setEditingId(item.id);
    form.reset({
      category: item.category as any,
      title: item.title,
      description: item.description,
      owner: item.owner,
      status: item.status as any,
      notes: item.notes || ""
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      category: "Business Requirements",
      title: "", description: "", owner: "", status: "In Progress", notes: ""
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: ItemFormValues) => {
    if (!currentProjectId) return;
    
    if (editingId) {
      updateItem({ projectId: currentProjectId, id: editingId, data: values }, {
        onSuccess: () => {
          toast({ title: "Item updated" });
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/workbook`] });
          setIsDialogOpen(false);
        }
      });
    } else {
      createItem({ projectId: currentProjectId, data: values }, {
        onSuccess: () => {
          toast({ title: "Item created" });
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/workbook`] });
          setIsDialogOpen(false);
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if(!currentProjectId || !confirm("Are you sure you want to delete this row?")) return;
    deleteItem({ projectId: currentProjectId, id }, {
      onSuccess: () => {
        toast({ title: "Item deleted" });
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/workbook`] });
      }
    });
  };

  const filteredItems = items?.filter(i => filterCategory === "All" || i.category === filterCategory) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Complete": return <Badge className="bg-emerald-500 hover:bg-emerald-600">Complete</Badge>;
      case "In Progress": return <Badge className="bg-amber-500 hover:bg-amber-600">In Progress</Badge>;
      case "Blocked": return <Badge className="bg-destructive hover:bg-destructive/90">Blocked</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Implementation Workbook</h2>
          <p className="text-muted-foreground mt-1">Manage requirements, decisions, and system dependencies.</p>
        </div>
        <Button onClick={openCreate} className="hover-elevate shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Add Row
        </Button>
      </div>

      <Card className="shadow-lg border-t-4 border-t-primary flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filter Category:</span>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[280px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <CardContent className="p-0 flex-1 overflow-auto custom-scrollbar bg-card relative">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <BookOpenIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No items found.</p>
              <p className="text-sm">Add a row to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[15%]">Category</TableHead>
                  <TableHead className="w-[20%]">Title</TableHead>
                  <TableHead className="w-[25%]">Description</TableHead>
                  <TableHead className="w-[10%]">Owner</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[15%]">Notes</TableHead>
                  <TableHead className="w-[5%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                      {item.category}
                    </TableCell>
                    <TableCell className="font-bold text-foreground">{item.title}</TableCell>
                    <TableCell className="text-sm">{item.description}</TableCell>
                    <TableCell className="text-sm">{item.owner}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]" title={item.notes}>
                      {item.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item as any)} className="h-8 w-8 text-primary hover:bg-primary/10">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Row' : 'Add New Row'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="owner" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Complete">Complete</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea className="resize-none h-20" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl><Textarea className="resize-none h-16" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isCreating || isUpdating} className="shadow-md hover-elevate">
                  {(isCreating || isUpdating) ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                  Save Row
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookOpenIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
