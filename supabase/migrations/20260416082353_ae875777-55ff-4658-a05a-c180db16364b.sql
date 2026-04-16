-- Create enums
CREATE TYPE public.project_status AS ENUM ('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled');
CREATE TYPE public.ticket_priority AS ENUM ('blocker', 'critical', 'high', 'medium', 'low');
CREATE TYPE public.ticket_status AS ENUM ('todo', 'in_progress', 'done', 'blocked');

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#4ade80',
  emoji TEXT,
  status public.project_status NOT NULL DEFAULT 'not_started',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  total_tasks_override INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#60a5fa',
  avatar_emoji TEXT DEFAULT '💻',
  responsibilities TEXT NOT NULL DEFAULT '',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket groups table
CREATE TABLE public.ticket_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.ticket_groups(id) ON DELETE SET NULL,
  priority public.ticket_priority NOT NULL DEFAULT 'medium',
  status public.ticket_status NOT NULL DEFAULT 'todo',
  estimated_hours NUMERIC,
  folder_path TEXT,
  dependencies TEXT[] DEFAULT '{}',
  subtasks_done INTEGER DEFAULT 0,
  subtasks_total INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Project documents table
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  doc_type TEXT NOT NULL DEFAULT 'other',
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  size INTEGER NOT NULL DEFAULT 0,
  data_url TEXT,
  url TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth, shared DB)
CREATE POLICY "Allow all select on projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert on projects" ON public.projects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update on projects" ON public.projects FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow all delete on projects" ON public.projects FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Allow all select on team_members" ON public.team_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert on team_members" ON public.team_members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update on team_members" ON public.team_members FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow all delete on team_members" ON public.team_members FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Allow all select on ticket_groups" ON public.ticket_groups FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert on ticket_groups" ON public.ticket_groups FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update on ticket_groups" ON public.ticket_groups FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow all delete on ticket_groups" ON public.ticket_groups FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Allow all select on tickets" ON public.tickets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert on tickets" ON public.tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update on tickets" ON public.tickets FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow all delete on tickets" ON public.tickets FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Allow all select on project_documents" ON public.project_documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert on project_documents" ON public.project_documents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update on project_documents" ON public.project_documents FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow all delete on project_documents" ON public.project_documents FOR DELETE TO anon, authenticated USING (true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_team_members_project ON public.team_members(project_id);
CREATE INDEX idx_tickets_project ON public.tickets(project_id);
CREATE INDEX idx_tickets_member ON public.tickets(member_id);
CREATE INDEX idx_tickets_group ON public.tickets(group_id);
CREATE INDEX idx_ticket_groups_project ON public.ticket_groups(project_id);
CREATE INDEX idx_project_documents_project ON public.project_documents(project_id);