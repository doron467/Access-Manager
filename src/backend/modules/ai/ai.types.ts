export interface AccessRequestContext {
  request: {
    id: string
    accessLevel: 'READ' | 'WRITE'
    state: 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: Date
  }

  requester: {
    id: string
    username: string
    role: string
  }

  application: {
    id: string
    name: string
    description: string
  }
}

export interface AIReview {
  recommendation: 'APPROVE' | 'REJECT' | 'REVIEW'
  confidence: number
  reasoning: string
}