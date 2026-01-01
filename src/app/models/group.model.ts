// Models and DTOs for student groups

export interface GroupMemberDTO {
  userId: number; // int64
  userName: string;
  userEmail: string;
  owner: boolean;
}

export interface CreateStudentGroupDTO {
  name: string; // 2..255 chars
  description?: string; // 0..1000 chars
  memberIds?: number[];
  budget?: number; // Budget für die Gruppe
}

export interface UpdateStudentGroupDTO {
  name?: string; // 2..255 chars
  description?: string; // 0..1000 chars
  budget?: number; // Budget für die Gruppe
}

export interface StudentGroupDTO {
  id: number; // int64
  name: string;
  description?: string;
  createdById?: number; // int64
  createdByName?: string;
  budget?: number;
  members?: GroupMemberDTO[]; // array<object>
  memberCount?: number; // int32
  activeBookingsCount?: number; // int32
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

// Backwards-compatible aliases used in existing services
export type Group = StudentGroupDTO;
export type GroupCreateDTO = CreateStudentGroupDTO;
export type GroupUpdateDTO = UpdateStudentGroupDTO;
