import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProject } from "@/lib/project-context";
import { 
  useListProjects, 
  useCreateProject, 
  useUpdateProject 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, FolderPlus, Edit3 } from "lucide-react";

const projectSchema = z.object({
  name: z.string().min(2, "Name is required"),
  client: z.string().min(2, "Client is required"),
  system: z.string().min(2, "System is required"),
  sponsor: z.string().min(2, "Sponsor is required"),
  startDate: z.string().min(1, "Start date is required"),
  targetGoLive: z.string().min(1, "Target go-live date is required"),
  complexity: z.enum(["Low", "Medium", "High"]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectSetup() {
  const { currentProjectId, setCurrentProjectId } = useProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: projects, isLoading: pLoading } = useListProjects();
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();

  const currentProject = projects?.find(p => p.id === currentProjectId);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "", client: "", system: "", sponsor: "",
      startDate: "", targetGoLive: "", complexity: "Medium"
    }
  });

  // Populate form when current project changes
  useEffect(() => {
    if (currentProject) {
      form.reset({
        name: currentProject.name,
        client: currentProject.client,
        system: currentProject.system,
        sponsor: currentProject.sponsor,
        // Assuming API returns ISO strings, strip time for input type="date"
        startDate: currentProject.startDate ? currentProject.startDate.substring(0,10) : "",
        targetGoLive: currentProject.targetGoLive ? currentProject.targetGoLive.substring(0,10) : "",
        complexity: currentProject.complexity as any,
      });
    } else {
      form.reset({
        name: "", client: "", system: "", sponsor: "",
        startDate: "", targetGoLive: "", complexity: "Medium"
      });
    }
  }, [currentProject, form]);

  const onSubmit = (values: ProjectFormValues) => {
    if (currentProject) {
      updateProject({ id: currentProject.id, data: values }, {
        onSuccess: () => {
          toast({ title: "Project updated successfully" });
          queryClient.invalidateQueries({ queryKey: [`/api/projects`] });
        }
      });
    } else {
      createProject({ data: values }, {
        onSuccess: (data) => {
          toast({ title: "Project created successfully" });
          setCurrentProjectId(data.id);
          queryClient.invalidateQueries({ queryKey: [`/api/projects`] });
        }
      });
    }
  };

  const handleCreateNew = () => {
    setCurrentProjectId(null); // clears selection, clears form via useEffect
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Project Setup</h2>
          <p className="text-muted-foreground mt-1">Configure implementation details and parameters.</p>
        </div>
        {currentProject && (
          <Button variant="outline" onClick={handleCreateNew} className="hover-elevate bg-background">
            <PlusIcon className="w-4 h-4 mr-2" />
            Start New Project
          </Button>
        )}
      </div>

      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="bg-muted/20 border-b border-border">
          <CardTitle className="flex items-center gap-2">
            {currentProject ? <Edit3 className="w-5 h-5 text-primary" /> : <FolderPlus className="w-5 h-5 text-primary" />}
            {currentProject ? 'Edit Project Details' : 'Create New Project'}
          </CardTitle>
          <CardDescription>
            These details will appear on the executive dashboard and reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Corp IWMS Rollout" {...field} className="bg-background focus-visible:ring-primary shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="client" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Client / Account</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Corp" {...field} className="bg-background shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="system" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">System Implemented</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Archibus, Tririga, Maximo" {...field} className="bg-background shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="sponsor" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Project Sponsor</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Jane Doe" {...field} className="bg-background shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-background shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="targetGoLive" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Target Go-Live Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-background shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="complexity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">Project Complexity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background shadow-sm">
                          <SelectValue placeholder="Select complexity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low (Standard Config)</SelectItem>
                        <SelectItem value="Medium">Medium (Some Customization)</SelectItem>
                        <SelectItem value="High">High (Heavy Customization/Integrations)</SelectItem>
                      </SelectContent>
                    </Select>
                    <CardDescription className="text-xs mt-1">Affects risk scoring algorithms.</CardDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <Button type="submit" size="lg" disabled={isPending} className="hover-elevate shadow-md px-8">
                  {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  {currentProject ? 'Save Changes' : 'Create Project'}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Project Roster Summary */}
      {projects && projects.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-bold text-foreground mb-4 border-b border-border pb-2">Your Projects</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projects.map(p => (
              <div 
                key={p.id} 
                onClick={() => setCurrentProjectId(p.id)}
                className={`p-4 rounded-xl border bg-card cursor-pointer transition-all hover-elevate ${
                  p.id === currentProjectId 
                    ? 'border-primary shadow-md ring-1 ring-primary/20' 
                    : 'border-border shadow-sm hover:border-primary/50'
                }`}
              >
                <h4 className="font-bold text-foreground truncate">{p.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{p.client} • {p.system}</p>
                <div className="mt-3 flex justify-between items-center text-xs font-medium">
                  <span className="text-muted-foreground">{p.targetGoLive?.substring(0,10) || 'No date'}</span>
                  <span className={`px-2 py-0.5 rounded-md ${
                    p.complexity === 'High' ? 'bg-red-100 text-red-800' :
                    p.complexity === 'Medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {p.complexity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Quick inline icon component to avoid huge lucide import block
function PlusIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
}
