export interface Specialty {
  id: number;
  nameAr: string;
  nameEn: string;
  icon?: string;
  code?: string;
}

export interface LookupItem {
  id: number;
  nameAr: string;
  nameEn?: string;
  cityId?: number;
}

export interface Doctor {
  id: number;
  fullName: string;
  fullNameAr?: string;
  fullNameEn?: string;
  titleAr?: string;
  specialty: string;
  specialtyNames?: string[];
  specialtyId?: number;
  specialtyIds?: number[];
  area: string;
  city?: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  onlineFee?: number;
  consultationType: 'IN_CLINIC' | 'ONLINE' | 'BOTH';
  profileImageUrl?: string;
  bio?: string;
  yearsExperience?: number;
  clinicName?: string;
  clinicId?: number;
  verified?: boolean;
  acceptsOnline?: boolean;
  acceptsInClinic?: boolean;
  availableToday?: boolean;
  patientCount?: number;
}

export interface TimeSlot {
  id: string;
  time: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface DoctorSearchParams {
  name?: string;
  specialtyId?: number;
  areaId?: number;
  minPrice?: number;
  maxPrice?: number;
  consultationType?: string;
  minRating?: number;
}
