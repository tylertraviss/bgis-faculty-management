import { useState } from "react";
import { useProject } from "@/lib/project-context";
import { useListMilestones, useUpdateMilestone } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, User, Edit3, Save } from "lucide-react";
import { Milestone } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Milestones() {
  const { currentProjectId } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: milestones, isLoading } = useListMilestones(currentProjectId!);
  const { mutate: updateMilestone } = useUpdateMilestone();

  // Sort them so they display in proper phase order
  const sortedMilestones = milestones ? [...milestones].sort((a,b) => a.sortOrder - b.sortOrder) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete": return "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20";
      case "In Progress": return "bg-blue-500 border-blue-500 text-white shadow-blue-500/20";
      case "At Risk": return "bg-destructive border-destructive text-white shadow-destructive/20";
      default: return "bg-muted border-border text-muted-foreground";
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div>
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Milestone Tracker</h2>
        <p className="text-muted-foreground mt-1">Track standard implementation phases and adjust dates.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-card rounded-2xl shadow-lg border border-border overflow-x-auto custom-scrollbar">
        <div className="flex items-center min-w-max py-12 px-8">
          {sortedMilestones.map((m, index) => (
            <div key={m.id} className="flex items-center">
              
              {/* Milestone Node */}
              <MilestoneNode 
                milestone={m as any} 
                projectId={currentProjectId!}
                onUpdate={(data) => {
                  updateMilestone({ projectId: currentProjectId!, id: m.id, data }, {
                    onSuccess: () => {
                      toast({ title: "Milestone updated" });
                      queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/milestones`] });
                    }
                  });
                }}
              />
              
              {/* Connecting Line */}
              {index < sortedMilestones.length - 1 && (
                <div className={`w-16 md:w-32 h-1.5 transition-colors duration-500 ${
                  m.status === 'Complete' ? 'bg-emerald-500' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Subcomponent for the Milestone node + popover editor
function MilestoneNode({ 
  milestone, 
  projectId,
  onUpdate 
}: { 
  milestone: Milestone, 
  projectId: number,
  onUpdate: (data: any) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    status: milestone.status,
    owner: milestone.owner || "",
    targetDate: milestone.targetDate ? milestone.targetDate.substring(0,10) : "",
    notes: milestone.notes || ""
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Complete": return "bg-emerald-500 ring-emerald-500/30 text-white";
      case "In Progress": return "bg-blue-500 ring-blue-500/30 text-white";
      case "At Risk": return "bg-destructive ring-destructive/30 text-white";
      default: return "bg-background border-2 border-border text-muted-foreground ring-transparent";
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative group cursor-pointer hover-elevate no-default-hover-elevate transition-all duration-300">
          
          {/* Status Dot/Circle */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ring-4 ring-offset-2 ring-offset-card transition-all z-10 relative ${getStatusStyles(milestone.status)}`}>
            {milestone.status === 'Complete' ? (
              <CheckIcon className="w-8 h-8" />
            ) : (
              <span className="font-bold text-lg">{milestone.sortOrder}</span>
            )}
          </div>

          {/* Label Card below */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 text-center bg-card border border-border shadow-sm rounded-lg p-3 group-hover:border-primary/50 transition-colors">
            <h4 className="font-bold text-foreground text-sm leading-tight mb-2">{milestone.phase}</h4>
            
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{milestone.targetDate ? new Date(milestone.targetDate).toLocaleDateString() : 'Set Date'}</span>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 py-1 px-2 rounded mt-2 truncate">
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{milestone.owner || 'Unassigned'}</span>
            </div>
            
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
              <Edit3 className="w-4 h-4" />
            </div>
          </div>

        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-5 shadow-xl border-t-4 border-t-primary" sideOffset={100}>
        <div className="space-y-4">
          <h4 className="font-bold text-lg text-foreground border-b border-border pb-2 flex justify-between items-center">
            {milestone.phase}
            <Badge variant="outline" className="bg-muted">{milestone.status}</Badge>
          </h4>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Complete">Complete</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Date</Label>
            <Input type="date" value={formData.targetDate} onChange={(e) => setFormData({...formData, targetDate: e.target.value})} />
          </div>

          <div className="space-y-2">
            <Label>Owner</Label>
            <Input value={formData.owner} onChange={(e) => setFormData({...formData, owner: e.target.value})} placeholder="e.g. John Doe" />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea 
              className="resize-none h-20 text-sm" 
              value={formData.notes} 
              onChange={(e) => setFormData({...formData, notes: e.target.value})} 
              placeholder="Phase specifics..."
            />
          </div>

          <Button className="w-full hover-elevate shadow-md mt-2" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Save Milestone
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CheckIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>;
}
