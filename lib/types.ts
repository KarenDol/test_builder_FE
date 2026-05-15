export type UserRole = 'admin' | 'student'

export interface Profile {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface StudentListItem {
  id: string
  email: string
  name: string | null
  first_name: string | null
  last_name: string | null
  school_name: string | null
  school_class: string | null
  ent_profile: string | null
  created_at: string
}

export interface Subject {
  id: string
  name: string
  created_at: string
}

export interface Question {
  id: string
  subject_id: string | null
  question_text: string
  question_type: 'single_choice' | 'multiple_choice'
  options: string[]
  correct_answers: string[]
  points: number
  created_by: string | null
  created_at: string
  updated_at: string
  subject?: Subject
}

export interface Test {
  id: string
  title: string
  description: string | null
  subject_id: string | null
  duration_minutes: number | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  subject?: Subject
  questions?: Question[]
  question_count?: number
}

export interface TestQuestion {
  id: string
  test_id: string
  question_id: string
  question_order: number
  question?: Question
}

export interface Submission {
  id: string
  student_id: string
  test_id: string
  answers: Record<string, string[]>
  total_score: number
  max_score: number
  percentage: number
  started_at: string
  submitted_at: string | null
  test?: Test
  student?: Profile
}
