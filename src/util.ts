import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import _ from 'lodash'

const CORS_PROXY = process.env.CORS_PROXY
const CORS_PROXY2 = process.env.CORS_PROXY2

const debug = console.log

export async function reqWithCors(options: AxiosRequestConfig) {
  const opts = _.defaults(options, {
    method: 'GET',
  })
  const getRes = (tryNum = 0) => {
    return axios.request({
      ...opts,
      url: `${tryNum === 0 ? CORS_PROXY : CORS_PROXY2}${opts.url}`,
    })
  }

  let ret

  const handleError = (e: AxiosError) => {
    console.error(e)
    if (e.response && e.response.status === 429) {
      try {
        return getRes(1)
      } catch (ee) {
        throw getAppError('rate-limited')
      }
    }

    throw e
  }

  try {
    ret = await getRes()
  } catch (e) {
    ret = await handleError(e)
  }

  return ret.data
}

function getAppError(mes: string) {
  const e = new Error(mes)

  e.name = 'AppError'

  return e
}

export function prettyNumber(num: number) {
  if (num > 999) return (num / 1000).toFixed(1) + 'k'
  return num
}
