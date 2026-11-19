export enum CompanySize {
  Startup = 'startup',
  Small = 'small',
  Medium = 'medium',
  Enterprise = 'enterprise',
}

export enum CompanyIndustry {
  Technology = 'technology',
  Finance = 'finance',
  Healthcare = 'healthcare',
  Manufacturing = 'manufacturing',
  Retail = 'retail',
  Education = 'education',
  Other = 'other',
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: CompanyIndustry;
  size: CompanySize;
  website: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  annualRevenue: number | null;
  employeeCount: number | null;
  ownerId: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CompanyFormData = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;
export type CompanyEditData = Partial<Omit<Company, 'id'>>;
