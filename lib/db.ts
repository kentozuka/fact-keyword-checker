import { expect } from '@playwright/test'
import { writeFileSync } from 'fs'
import axios from 'axios'
import 'dotenv/config'

const API_ENDPOINT = process.env.API_ENDPOINT || ''

type Service = 'amazon' | 'rakuten' | 'yahoo-shopping'
// | 'google'
// | 'yahoo'
// | 'bing'

export interface Job {
  service: Service
  keyword: string
  owner: string
}

export async function generateJobs() {
  try {
    const res = await axios.get<Job[]>(API_ENDPOINT)
    const { data } = res
    writeFileSync('job.json', JSON.stringify(data, null, 2))
  } catch (e) {
    console.log(e)
  }
}

interface Res extends Job {
  result: string[]
}

export async function uploadData(data: Res) {
  try {
    const res = await axios.post(API_ENDPOINT, data)
    expect(res.status).toBe(200)
  } catch (e) {
    console.log(e)
  }
}
