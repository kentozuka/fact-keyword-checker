type Service = 'amazon' | 'rakuten' | 'yahoo-shopping'
// | 'google'
// | 'yahoo'
// | 'bing'

export interface Job {
  service: Service
  keyword: string
  owner: string
}

export const jobs: Job[] = [
  {
    service: 'amazon',
    keyword: 'ポータブル電源',
    owner: 'ecoflow'
  },
  {
    service: 'rakuten',
    keyword: 'ポータブル電源',
    owner: 'ecoflow'
  },
  {
    service: 'yahoo-shopping',
    keyword: 'ポータブル電源',
    owner: 'ecoflow'
  }
]

export const getJobs = (service: Service) =>
  jobs.filter((x) => x.service === service)
