import { useQuery, useMutation, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  client: string;
  system: string;
  sponsor: string;
  startDate: string;
  targetGoLive: string;
  complexity: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  client: string;
  system: string;
  sponsor: string;
  startDate: string;
  targetGoLive: string;
  complexity: string;
}

export interface WorkbookItem {
  id: number;
  projectId: number;
  category: string;
  title: string;
  description: string;
  owner: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface CreateWorkbookItemInput {
  category: string;
  title: string;
  description: string;
  owner: string;
  status: string;
  notes?: string;
}

export interface Milestone {
  id: number;
  projectId: number;
  phase: string;
  status: string;
  owner: string;
  targetDate?: string;
  completedDate?: string;
  notes?: string;
  sortOrder: number;
}

export interface UpdateMilestoneInput {
  status?: string;
  owner?: string;
  targetDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface UatScenario {
  id: number;
  projectId: number;
  title: string;
  description: string;
  tester: string;
  priority: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface CreateUatScenarioInput {
  title: string;
  description: string;
  tester: string;
  priority: string;
  status: string;
  notes?: string;
}

export interface ProjectStatus {
  id: number;
  projectId: number;
  ragStatus: string;
  weeklyUpdate: string;
  updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function useListProjects(): UseQueryResult<Project[]> {
  return useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => apiFetch<Project[]>("/api/projects"),
  });
}

export function useGetProject(id: number): UseQueryResult<Project> {
  return useQuery({
    queryKey: [`/api/projects/${id}`],
    queryFn: () => apiFetch<Project>(`/api/projects/${id}`),
    enabled: id != null,
  });
}

export function useCreateProject(): UseMutationResult<Project, Error, CreateProjectInput> {
  return useMutation({
    mutationFn: (data) =>
      apiFetch<Project>("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useUpdateProject(): UseMutationResult<
  Project,
  Error,
  { id: number; data: Partial<CreateProjectInput> }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<Project>(`/api/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

// ── Workbook ──────────────────────────────────────────────────────────────────

export function useListWorkbookItems(projectId: number): UseQueryResult<WorkbookItem[]> {
  return useQuery({
    queryKey: [`/api/projects/${projectId}/workbook`],
    queryFn: () => apiFetch<WorkbookItem[]>(`/api/projects/${projectId}/workbook`),
    enabled: projectId != null,
  });
}

export function useCreateWorkbookItem(): UseMutationResult<
  WorkbookItem,
  Error,
  { projectId: number; data: CreateWorkbookItemInput }
> {
  return useMutation({
    mutationFn: ({ projectId, data }) =>
      apiFetch<WorkbookItem>(`/api/projects/${projectId}/workbook`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useUpdateWorkbookItem(): UseMutationResult<
  WorkbookItem,
  Error,
  { projectId: number; id: number; data: Partial<CreateWorkbookItemInput> }
> {
  return useMutation({
    mutationFn: ({ projectId, id, data }) =>
      apiFetch<WorkbookItem>(`/api/projects/${projectId}/workbook/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

export function useDeleteWorkbookItem(): UseMutationResult<
  void,
  Error,
  { projectId: number; id: number }
> {
  return useMutation({
    mutationFn: ({ projectId, id }) =>
      apiFetch<void>(`/api/projects/${projectId}/workbook/${id}`, {
        method: "DELETE",
      }),
  });
}

// ── Milestones ────────────────────────────────────────────────────────────────

export function useListMilestones(projectId: number): UseQueryResult<Milestone[]> {
  return useQuery({
    queryKey: [`/api/projects/${projectId}/milestones`],
    queryFn: () => apiFetch<Milestone[]>(`/api/projects/${projectId}/milestones`),
    enabled: projectId != null,
  });
}

export function useUpdateMilestone(): UseMutationResult<
  Milestone,
  Error,
  { projectId: number; id: number; data: UpdateMilestoneInput }
> {
  return useMutation({
    mutationFn: ({ projectId, id, data }) =>
      apiFetch<Milestone>(`/api/projects/${projectId}/milestones/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

// ── UAT ───────────────────────────────────────────────────────────────────────

export function useListUatScenarios(projectId: number): UseQueryResult<UatScenario[]> {
  return useQuery({
    queryKey: [`/api/projects/${projectId}/uat`],
    queryFn: () => apiFetch<UatScenario[]>(`/api/projects/${projectId}/uat`),
    enabled: projectId != null,
  });
}

export function useCreateUatScenario(): UseMutationResult<
  UatScenario,
  Error,
  { projectId: number; data: CreateUatScenarioInput }
> {
  return useMutation({
    mutationFn: ({ projectId, data }) =>
      apiFetch<UatScenario>(`/api/projects/${projectId}/uat`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useUpdateUatScenario(): UseMutationResult<
  UatScenario,
  Error,
  { projectId: number; id: number; data: Partial<CreateUatScenarioInput> }
> {
  return useMutation({
    mutationFn: ({ projectId, id, data }) =>
      apiFetch<UatScenario>(`/api/projects/${projectId}/uat/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

export function useDeleteUatScenario(): UseMutationResult<
  void,
  Error,
  { projectId: number; id: number }
> {
  return useMutation({
    mutationFn: ({ projectId, id }) =>
      apiFetch<void>(`/api/projects/${projectId}/uat/${id}`, {
        method: "DELETE",
      }),
  });
}

// ── Status ────────────────────────────────────────────────────────────────────

export function useGetProjectStatus(projectId: number): UseQueryResult<ProjectStatus> {
  return useQuery({
    queryKey: [`/api/projects/${projectId}/status`],
    queryFn: () => apiFetch<ProjectStatus>(`/api/projects/${projectId}/status`),
    enabled: projectId != null,
  });
}

export function useUpdateProjectStatus(): UseMutationResult<
  ProjectStatus,
  Error,
  { projectId: number; data: { ragStatus: string; weeklyUpdate: string } }
> {
  return useMutation({
    mutationFn: ({ projectId, data }) =>
      apiFetch<ProjectStatus>(`/api/projects/${projectId}/status`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}
