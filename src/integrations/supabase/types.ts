export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      project_documents: {
        Row: {
          data_url: string | null
          doc_type: string
          id: string
          name: string
          project_id: string
          size: number
          uploaded_at: string
          url: string | null
        }
        Insert: {
          data_url?: string | null
          doc_type?: string
          id?: string
          name: string
          project_id: string
          size?: number
          uploaded_at?: string
          url?: string | null
        }
        Update: {
          data_url?: string | null
          doc_type?: string
          id?: string
          name?: string
          project_id?: string
          size?: number
          uploaded_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color: string
          created_at: string
          description: string
          emoji: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          tags: string[] | null
          total_tasks_override: number | null
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          emoji?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          total_tasks_override?: number | null
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          emoji?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          total_tasks_override?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_emoji: string | null
          color: string
          id: string
          joined_at: string
          name: string
          project_id: string
          responsibilities: string
          role: string
        }
        Insert: {
          avatar_emoji?: string | null
          color?: string
          id?: string
          joined_at?: string
          name: string
          project_id: string
          responsibilities?: string
          role: string
        }
        Update: {
          avatar_emoji?: string | null
          color?: string
          id?: string
          joined_at?: string
          name?: string
          project_id?: string
          responsibilities?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_groups: {
        Row: {
          color: string | null
          description: string | null
          id: string
          label: string
          project_id: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          description?: string | null
          id?: string
          label: string
          project_id: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          description?: string | null
          id?: string
          label?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_groups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          code: string
          completed_at: string | null
          created_at: string
          dependencies: string[] | null
          description: string
          estimated_hours: number | null
          folder_path: string | null
          group_id: string | null
          id: string
          member_id: string
          name: string
          notes: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          project_id: string
          status: Database["public"]["Enums"]["ticket_status"]
          subtasks_done: number | null
          subtasks_total: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          code: string
          completed_at?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string
          estimated_hours?: number | null
          folder_path?: string | null
          group_id?: string | null
          id?: string
          member_id: string
          name: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          project_id: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subtasks_done?: number | null
          subtasks_total?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          code?: string
          completed_at?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string
          estimated_hours?: number | null
          folder_path?: string | null
          group_id?: string | null
          id?: string
          member_id?: string
          name?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          project_id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subtasks_done?: number | null
          subtasks_total?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "ticket_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "on_hold"
        | "cancelled"
      ticket_priority: "blocker" | "critical" | "high" | "medium" | "low"
      ticket_status: "todo" | "in_progress" | "done" | "blocked"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      project_status: [
        "not_started",
        "in_progress",
        "completed",
        "on_hold",
        "cancelled",
      ],
      ticket_priority: ["blocker", "critical", "high", "medium", "low"],
      ticket_status: ["todo", "in_progress", "done", "blocked"],
    },
  },
} as const
