export interface AccessRequestContext {
  request: {
    id: string
    accessLevel: 'READ' | 'WRITE'
    reason: string
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