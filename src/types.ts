export interface Prospect {
  name: string;
  company: string;
  designation: string;
}

export interface ResearchResult extends Prospect {
  linkedinUrl: string;
}

export interface ResearchResponse {
  results: ResearchResult[];
}
