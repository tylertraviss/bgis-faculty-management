import { useState, useEffect } from "react";
import { useProject } from "@/lib/project-context";
import { 
  useListUatScenarios, 
  useCreateUatScenario, 
  useUpdateUatScenario,
  useDeleteUatScenario 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, GripVertical, Trash2, Edit2, User } from "lucide-react";
import { UatScenario } from "@workspace/api-client-react/src/generated/api.schemas";

const COLUMNS = ["Not Started", "In Testing", "Passed", "Failed"] as const;
type UatStatus = typeof COLUMNS[number];

export default function UatBoard() {
  const { currentProjectId } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: scenarios, isLoading } = useListUatScenarios(currentProjectId!);
  const { mutate: updateScenario } = useUpdateUatScenario();
  const { mutate: createScenario, isPending: isCreating } = useCreateUatScenario();
  const { mutate: deleteScenario } = useDeleteUatScenario();

  // Local state for optimistic drag & drop
  const [localScenarios, setLocalScenarios] = useState<UatScenario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<UatScenario | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "", description: "", tester: "", priority: "Medium", status: "Not Started"
  });

  useEffect(() => {
    if (scenarios) setLocalScenarios(scenarios as any);
  }, [scenarios]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as UatStatus;
    const scenarioId = parseInt(draggableId, 10);

    // Optimistic UI update
    setLocalScenarios(prev => prev.map(s => s.id === scenarioId ? { ...s, status: newStatus } : s));

    // API Call
    updateScenario(
      { projectId: currentProjectId!, id: scenarioId, data: { status: newStatus } },
      {
        onError: () => {
          toast({ title: "Failed to update status", variant: "destructive" });
          // Revert on error
          if(scenarios) setLocalScenarios(scenarios as any);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/uat`] });
        }
      }
    );
  };

  const handleSave = () => {
    if (!currentProjectId) return;
    
    if (editingScenario) {
      updateScenario(
        { projectId: currentProjectId, id: editingScenario.id, data: formData },
        {
          onSuccess: () => {
            toast({ title: "Scenario updated" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/uat`] });
          }
        }
      );
    } else {
      createScenario(
        { projectId: currentProjectId, data: formData as any },
        {
          onSuccess: () => {
            toast({ title: "Scenario created" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/uat`] });
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if(!confirm("Delete this test scenario?")) return;
    deleteScenario({ projectId: currentProjectId!, id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/uat`] })
    });
  };

  const openCreate = (status: UatStatus = "Not Started") => {
    setEditingScenario(null);
    setFormData({ title: "", description: "", tester: "", priority: "Medium", status });
    setIsDialogOpen(true);
  };

  const getColColor = (col: string) => {
    switch (col) {
      case "Passed": return "border-t-emerald-500 bg-emerald-50/50";
      case "Failed": return "border-t-red-500 bg-red-50/50";
      case "In Testing": return "border-t-blue-500 bg-blue-50/50";
      default: return "border-t-slate-400 bg-slate-50/50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical": return <Badge className="bg-red-600">Critical</Badge>;
      case "High": return <Badge className="bg-orange-500">High</Badge>;
      case "Medium": return <Badge className="bg-blue-500">Medium</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground">Low</Badge>;
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 flex flex-col h-full pb-4">
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">UAT Sign-Off Board</h2>
          <p className="text-muted-foreground mt-1">Drag and drop test scenarios through the testing lifecycle.</p>
        </div>
        <Button onClick={() => openCreate()} className="hover-elevate shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Add Scenario
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto pb-4 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full min-w-max items-stretch">
            {COLUMNS.map(col => {
              const colScenarios = localScenarios.filter(s => s.status === col);
              return (
                <div key={col} className={`w-80 flex flex-col rounded-xl border border-border shadow-sm border-t-4 ${getColColor(col)}`}>
                  <div className="p-3 border-b border-border/50 flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-t-xl">
                    <h3 className="font-bold text-foreground">{col}</h3>
                    <Badge variant="secondary" className="bg-background shadow-sm">{colScenarios.length}</Badge>
                  </div>
                  
                  <Droppable droppableId={col}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        className={`flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col gap-3 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-primary/5' : ''
                        }`}
                      >
                        {colScenarios.map((s, index) => (
                          <Draggable key={s.id} draggableId={s.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <Card 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`shadow-sm border border-border group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20 rotate-2' : 'hover:border-primary/40'}`}
                              >
                                <div className="p-3">
                                  <div className="flex justify-between items-start gap-2 mb-2">
                                    <div className="flex items-start gap-2">
                                      <div {...provided.dragHandleProps} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing mt-0.5">
                                        <GripVertical className="w-4 h-4" />
                                      </div>
                                      <h4 className="font-bold text-sm leading-tight line-clamp-2">{s.title}</h4>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {getPriorityBadge(s.priority)}
                                    </div>
                                  </div>
                                  
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 pl-6">
                                    {s.description}
                                  </p>
                                  
                                  <div className="flex justify-between items-center pl-6 border-t border-border/50 pt-2 mt-2">
                                    <div className="flex items-center text-xs font-medium text-foreground bg-muted/50 px-2 py-1 rounded">
                                      <User className="w-3 h-3 mr-1 text-primary" />
                                      {s.tester}
                                    </div>
                                    
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => {
                                        setEditingScenario(s);
                                        setFormData(s as any);
                                        setIsDialogOpen(true);
                                      }}>
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(s.id)}>
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {colScenarios.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg m-2 opacity-50">
                            <p className="text-xs font-medium">Drop items here</p>
                          </div>
                        )}
                        
                        <Button variant="ghost" className="w-full mt-2 text-muted-foreground hover:bg-white/50 border border-transparent hover:border-border border-dashed" onClick={() => openCreate(col)}>
                          <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingScenario ? 'Edit Scenario' : 'New Test Scenario'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Scenario Title</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assigned Tester</Label>
                <Input value={formData.tester} onChange={e => setFormData({...formData, tester: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                className="h-24 resize-none" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isCreating} className="hover-elevate shadow-md">
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                Save Scenario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
