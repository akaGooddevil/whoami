import createClient from 'openapi-fetch'
import type { paths } from './api-schema'
import { mockFetch } from './mock-backend'

export const apiClient = createClient<paths>({
  baseUrl: 'https://api.dummy.local',
  fetch: mockFetch,
})
