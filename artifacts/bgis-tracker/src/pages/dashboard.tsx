import { useState, useEffect } from "react";
import { useProject } from "@/lib/project-context";
import { 
  useGetProject, 
  useListWorkbookItems, 
  useListMilestones, 
  useListUatScenarios,
  useGetProjectStatus,
  useUpdateProjectStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle2, Clock, CalendarDays, Activity, BarChart3, Save, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, parseISO } from "date-fns";

export default function Dashboard() {
  const { currentProjectId } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Data Fetching
  const { data: project, isLoading: pLoading } = useGetProject(currentProjectId!);
  const { data: workbook, isLoading: wLoading } = useListWorkbookItems(currentProjectId!);
  const { data: milestones, isLoading: mLoading } = useListMilestones(currentProjectId!);
  const { data: uat, isLoading: uLoading } = useListUatScenarios(currentProjectId!);
  const { data: status, isLoading: sLoading } = useGetProjectStatus(currentProjectId!);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateProjectStatus();

  // Local state for weekly update edit
  const [weeklyUpdateText, setWeeklyUpdateText] = useState("");
  const [ragStatus, setRagStatus] = useState<"Green" | "Amber" | "Red">("Green");

  useEffect(() => {
    if (status) {
      setWeeklyUpdateText(status.weeklyUpdate || "");
      setRagStatus(status.ragStatus || "Green");
    }
  }, [status]);

  if (pLoading || wLoading || mLoading || uLoading || sLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return null;

  // --- Calculations ---

  // 1. Completion %
  const totalWorkbook = workbook?.length || 0;
  const completedWorkbook = workbook?.filter(i => i.status === "Complete").length || 0;
  const completionPercent = totalWorkbook === 0 ? 0 : Math.round((completedWorkbook / totalWorkbook) * 100);

  // 2. Risk Level (Low/Medium/High)
  // Logic: Low complexity + Green = Low. Medium = Medium. High Complexity OR Red RAG = High
  let calculatedRisk = "Medium";
  if (project.complexity === "Low" && ragStatus === "Green") calculatedRisk = "Low";
  if (project.complexity === "High" || ragStatus === "Red") calculatedRisk = "High";

  // 3. Days to Go-Live
  const daysToGoLive = project.targetGoLive ? differenceInDays(parseISO(project.targetGoLive), new Date()) : null;

  // 4. UAT Stats
  const totalUat = uat?.length || 0;
  const passedUat = uat?.filter(u => u.status === "Passed").length || 0;
  const failedUat = uat?.filter(u => u.status === "Failed").length || 0;
  const testingUat = uat?.filter(u => u.status === "In Testing").length || 0;

  // Handlers
  const handleSaveStatus = () => {
    if (!currentProjectId) return;
    
    updateStatus(
      { 
        projectId: currentProjectId, 
        data: { ragStatus, weeklyUpdate: weeklyUpdateText } 
      },
      {
        onSuccess: () => {
          toast({ title: "Status saved successfully" });
          queryClient.invalidateQueries({ queryKey: [`/api/projects/${currentProjectId}/status`] });
        },
        onError: () => {
          toast({ title: "Failed to save status", variant: "destructive" });
        }
      }
    );
  };

  const getRagColor = (rag: string) => {
    switch (rag) {
      case "Green": return "bg-emerald-500";
      case "Amber": return "bg-amber-500";
      case "Red": return "bg-red-500";
      default: return "bg-gray-300";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Meta Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">{project.name}</h2>
          <div className="flex items-center gap-3 mt-2 text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> {project.system}</span>
            <span>•</span>
            <span>Client: {project.client}</span>
            <span>•</span>
            <span>Sponsor: {project.sponsor}</span>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm bg-background">
          Complexity: <span className="font-bold ml-1 text-foreground">{project.complexity}</span>
        </Badge>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-t-4 border-t-primary hover-elevate no-default-hover-elevate">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completion</p>
                <div className="text-4xl font-bold text-foreground flex items-baseline gap-1">
                  {completionPercent}<span className="text-2xl text-muted-foreground">%</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <CheckSquare className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-t-4 hover-elevate no-default-hover-elevate ${
          calculatedRisk === 'High' ? 'border-t-destructive' : 
          calculatedRisk === 'Medium' ? 'border-t-amber-500' : 'border-t-emerald-500'
        }`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Project Risk</p>
                <div className={`text-3xl font-bold ${
                  calculatedRisk === 'High' ? 'text-destructive' : 
                  calculatedRisk === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {calculatedRisk}
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                calculatedRisk === 'High' ? 'bg-destructive/10' : 
                calculatedRisk === 'Medium' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
              }`}>
                <AlertCircle className={`w-6 h-6 ${
                  calculatedRisk === 'High' ? 'text-destructive' : 
                  calculatedRisk === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-sm border-t-4 hover-elevate no-default-hover-elevate ${
          ragStatus === 'Red' ? 'border-t-red-500' : 
          ragStatus === 'Amber' ? 'border-t-amber-500' : 'border-t-emerald-500'
        }`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">RAG Status</p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full shadow-inner ${getRagColor(ragStatus)} animate-pulse`} />
                  <span className="text-3xl font-bold text-foreground">{ragStatus}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-t-4 border-t-accent hover-elevate no-default-hover-elevate">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Target Go-Live</p>
                <div className="text-3xl font-bold text-foreground">
                  {daysToGoLive !== null ? (
                    daysToGoLive > 0 ? `${daysToGoLive} Days` : 'Past Due'
                  ) : 'Not Set'}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {project.targetGoLive ? new Date(project.targetGoLive).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <CalendarDays className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left Column: Updates & UAT */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          <Card className="shadow-sm flex-1 flex flex-col min-h-[300px]">
            <CardHeader className="border-b border-border pb-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Weekly Executive Status Update
                </CardTitle>
                
                <div className="flex gap-2 p-1 bg-muted rounded-md">
                  {["Green", "Amber", "Red"].map(s => (
                    <button
                      key={s}
                      onClick={() => setRagStatus(s as any)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        ragStatus === s 
                          ? 'bg-background shadow-sm text-foreground' 
                          : 'text-muted-foreground hover:bg-background/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col relative">
              <Textarea 
                value={weeklyUpdateText}
                onChange={(e) => setWeeklyUpdateText(e.target.value)}
                placeholder="Enter executive summary, key risks, and accomplishments for the week..."
                className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none p-6 text-base leading-relaxed bg-transparent min-h-[200px]"
              />
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={handleSaveStatus} 
                  disabled={isUpdatingStatus}
                  className="shadow-md hover-elevate"
                >
                  {isUpdatingStatus ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Update
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                UAT Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <div className="bg-muted p-4 rounded-xl text-center">
                  <p className="text-3xl font-bold text-foreground">{totalUat}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase mt-1">Total</p>
                </div>
                <div className="bg-emerald-500/10 p-4 rounded-xl text-center">
                  <p className="text-3xl font-bold text-emerald-600">{passedUat}</p>
                  <p className="text-xs font-medium text-emerald-700 uppercase mt-1">Passed</p>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-xl text-center">
                  <p className="text-3xl font-bold text-blue-600">{testingUat}</p>
                  <p className="text-xs font-medium text-blue-700 uppercase mt-1">Testing</p>
                </div>
                <div className="bg-red-500/10 p-4 rounded-xl text-center">
                  <p className="text-3xl font-bold text-red-600">{failedUat}</p>
                  <p className="text-xs font-medium text-red-700 uppercase mt-1">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Milestones */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm h-full flex flex-col">
            <CardHeader className="border-b border-border pb-4 bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Milestone Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <div className="space-y-6">
                {milestones?.sort((a,b) => a.sortOrder - b.sortOrder).map((m, i) => (
                  <div key={m.id} className="relative flex gap-4">
                    {/* Vertical Line */}
                    {i !== milestones.length - 1 && (
                      <div className="absolute left-2.5 top-8 bottom-[-24px] w-0.5 bg-border z-0" />
                    )}
                    
                    <div className="relative z-10 mt-1">
                      <div className={`w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center ${
                        m.status === 'Complete' ? 'border-emerald-500 bg-emerald-500' :
                        m.status === 'In Progress' ? 'border-blue-500 bg-background' :
                        m.status === 'At Risk' ? 'border-destructive bg-destructive' :
                        'border-muted-foreground'
                      }`}>
                        {m.status === 'Complete' && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    
                    <div className="flex-1 pb-2">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-semibold ${m.status === 'Complete' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {m.phase}
                        </h4>
                        <span className="text-xs font-medium text-muted-foreground">
                          {m.targetDate ? new Date(m.targetDate).toLocaleDateString() : '-'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {m.status} • {m.owner || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
