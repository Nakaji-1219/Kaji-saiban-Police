
export interface Rule {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export type ViolationStatus = 'pending' | 'defended' | 'guilty' | 'innocent';
export type AppRole = 'partner1' | 'partner2' | 'observer';

export interface Violation {
  id: string;
  ruleId: string;
  violator: 'partner1' | 'partner2';
  timestamp: number;
  status: ViolationStatus;
  defense?: string;
  accusalComment?: string; // 告発時のコメント
  judgmentComment?: string;
  scoreApplied?: number;
}

export interface UserSettings {
  partner1Name: string;
  partner2Name: string;
  partner1Punishment: string;
  partner2Punishment: string;
  penaltyThreshold: number;
}

export interface AppState {
  rules: Rule[];
  violations: Violation[];
  settings: UserSettings;
  deviceRole?: AppRole; // このデバイスの操作権限
}
