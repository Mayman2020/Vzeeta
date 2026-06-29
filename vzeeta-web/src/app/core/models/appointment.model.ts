export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED' | 'RESCHEDULED';
export type ConsultationType = 'IN_CLINIC' | 'ONLINE';

export interface Appointment {
  id: number;
  appointmentNumber: string;
  patientId: number;
  doctorId: number;
  clinicId?: number;
  branchId?: number;
  specialtyId?: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  notes?: string;
  feeAmount: number;
  doctorNameAr?: string;
  doctorNameEn?: string;
  patientNameAr?: string;
  patientNameEn?: string;
  clinicNameAr?: string;
  branchNameAr?: string;
  specialtyNameAr?: string;
}

export interface BookAppointmentRequest {
  doctorId: number;
  branchId?: number;
  specialtyId?: number;
  appointmentDate: string;
  startTime: string;
  consultationType: ConsultationType;
  notes?: string;
}
