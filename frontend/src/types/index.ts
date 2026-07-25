export type ActiveTab = 
  | 'dashboard'
  | 'papers' 
  | 'analytics' 
  | 'stats' 
  | 'ml' 
  | 'sql' 
  | 'compliance' 
  | 'assistant';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'LEAD_RESEARCHER' | 'RESEARCH_SCIENTIST' | 'AUDITOR';
}

export interface PaperSearchResult {
  paper_id: string;
  paper_title: string;
  chunk_index: number;
  content: string;
  similarity_score: number;
  page_number?: number;
}

export interface AnalyticsSummary {
  dataset_id: string;
  total_rows: number;
  total_columns: number;
  columns: string[];
  missing_values: Record<string, number>;
  outliers_detected: {
    method: string;
    anomalous_row_count: number;
    percentage: number;
  };
}

export interface StatsResponse {
  test_type: string;
  statistic: number;
  p_value: number;
  is_significant: boolean;
  interpretation: str;
  details: Record<string, any>;
}

export interface MLTrainResult {
  model_id: string;
  model_name: string;
  mlflow_run_id?: string;
  metrics: Record<string, number>;
  feature_importance: Record<string, number>;
}

export interface SQLResult {
  generated_sql: string;
  execution_status: string;
  execution_time_ms: number;
  columns: string[];
  rows: any[][];
  recommended_chart: {
    chart_type: string;
    x_axis?: string;
    y_axis?: string;
  };
  explanation: string;
}

export interface ComplianceResult {
  report_id: string;
  compliance_score: number;
  overall_status: string;
  missing_steps: Array<{
    step_number: number;
    requirement: string;
    severity: string;
  }>;
  risk_score: number;
  audit_log_id: string;
}

export interface AgentChatMessage {
  sender: 'user' | 'assistant' | 'agent';
  agentName?: string;
  text: string;
  timestamp: string;
}
