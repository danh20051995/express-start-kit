import { HTTP } from '../../http'
import { buildResponse } from './buildResponse'

export const RESPONSE_NO_CONTENT = buildResponse({ code: HTTP._CODE.NO_CONTENT })
