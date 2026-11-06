export type CourtCircuitType = 'جزائية' | 'عامة' | 'تجارية' | 'عمالية' | 'أحوال شخصية' | 'استئناف' | 'أخرى';
export type VerdictClassification = 'إدانة' | 'براءة' | 'رد دعوى' | 'إلزام مالي' | 'فسخ عقد' | 'حكم مستعجل' | 'أخرى';

export interface AppealDeadlineInfo {
  daysAllowed: number; // 30 for regular, 10 for urgent
  verdictType: 'حكم عادي' | 'حكم مستعجل' | string;
  statutoryBasis: string; // e.g. المادة 187 من نظام المرافعات الشرعية أو المادة 194 من نظام الإجراءات الجزائية
  deadlineNotes: string;
  isUrgent: boolean;
}

export interface JudicialGroundDetail {
  groundText: string;
  statuteArticle?: string;
  evaluation: 'تسبيب محكم' | 'شبهة قصور في التسبيب' | 'مخالفة للأصل النظامي' | 'استدلال سليم' | string;
  rebuttalForAppeal?: string; // ثغرة الطعن بالاستئناف
}

export interface DetailedDeedAnalysis {
  isDeed: boolean;
  courtName: string;
  courtLocation: string;
  circuitType: CourtCircuitType;
  circuitName: string;
  deedNumber: string;
  deedDate: string;
  originalCaseNumber: string;
  originalCaseDate?: string;
  parties: {
    plaintiffs: Party[];
    defendants: Party[];
    publicProsecutor?: Party;
  };
  caseFacts: {
    claimSummary: string; // ملخص دعوى المدعي
    responseSummary: string; // جواب المدعى عليه
    defensesPresented: string[]; // الدفوع المثارة أثناء الجلسات
  };
  reasoningAndGrounds: {
    judicialGrounds: JudicialGroundDetail[];
    statutoryArticlesApplied: string[];
    reasoningDefects: string[]; // الثغرات والقصور في التسبيب
  };
  verdict: {
    pronouncedText: string; // نص منطوق الحكم
    classification: VerdictClassification;
    executability?: string; // الصفة التنفيذية
  };
  appealDeadline: AppealDeadlineInfo;
  appealStrategicPoints: string[]; // نقاط الطعن الجوهرية بالاستئناف
}

export interface Party {
  name: string;
  role: 'متهم' | 'مجني عليه' | 'شاهد' | 'مدعي عام' | 'رجل ضبط جنائي' | 'مدعي' | 'مدعى عليه' | 'خبير فني' | string;
  idNumber?: string;
  nationality?: string;
  job?: string;
  statementsSummary?: string;
}

export interface ArrestDetails {
  authority: string;
  dateTime: string;
  location: string;
  circumstances: string;
  isFlagrantCrime?: boolean;
}

export interface ProceduralViolation {
  violation: string;
  articleReference: string;
  legalImpact: string;
}

export interface ProceduralLegality {
  arrestLegality: string;
  detentionPeriods: string;
  isDetentionExceeded?: boolean;
  hoursHeldByPolice?: string;
  rightsObserved: string;
  proceduralViolations: ProceduralViolation[];
}

export interface ChargeAndStatute {
  charge: string;
  statute: string;
  article: string;
  penalty?: string;
}

export interface PhysicalEvidence {
  description: string;
  seizureMethod?: string;
  forensicReport?: string;
  validityNotes?: string;
}

export interface TestimonyComparison {
  partyName: string;
  policeStatement: string;
  prosecutionStatement: string;
  courtStatement?: string;
  discrepancies: string;
  claimsOfCoercion?: string;
}

export interface EvidenceEvaluation {
  confessionAssessment?: string;
  digitalEvidenceAssessment?: string;
  witnessAssessment?: string;
  officialDocumentsAssessment?: string;
  statuteArticlesReferenced?: string[];
}

export interface LegalDefenseItem {
  defense: string;
  legalGround: string;
  practicalApplication: string;
}

export interface DefenseStrategy {
  formalDefenses: LegalDefenseItem[];
  substantiveDefenses: LegalDefenseItem[];
}

export interface DeedVerdict {
  courtName?: string;
  verdictText: string;
  judicialGrounds?: string[];
  legalStatus?: string;
  detailedDeed?: DetailedDeedAnalysis;
}

export interface AnalysisResult {
  caseSummary: string;
  caseNumber?: string;
  caseDate?: string;
  jurisdiction?: string;
  parties: Party[];
  arrestDetails?: ArrestDetails;
  proceduralLegality: ProceduralLegality;
  chargesAndStatutes: ChargeAndStatute[];
  physicalEvidence?: PhysicalEvidence[];
  testimonyComparison?: TestimonyComparison[];
  evidenceEvaluationUnderSaudiEvidenceLaw: EvidenceEvaluation;
  defenseStrategy: DefenseStrategy;
  deedVerdict?: DeedVerdict;
  detailedDeed?: DetailedDeedAnalysis;
  unclearOrMissingElements?: string[];
  disclaimer: string;
  documentSourceType?: 'text' | 'image' | 'pdf';
  fileName?: string;
}

export interface StatuteArticle {
  number: number;
  title: string;
  text: string;
}

export interface StatuteCategory {
  id: string;
  name: string;
  enactment: string;
  category: string;
  articles: StatuteArticle[];
}
