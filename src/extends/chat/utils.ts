import type { ApiRequest } from 'aurorax'

/**
 * Util function to create a pure text request
 * @returns A pure text request
 */
export function pureTextRequest (eventId: number, isGroup: boolean, str: string):
Omit<ApiRequest<'send_group_msg' | 'send_private_msg'>, 'echo'> {
  return isGroup
    ? {
        action: 'send_group_msg',
        params: {
          group_id: eventId,
          message: str,
        },
      } as const
    : {
        action: 'send_private_msg',
        params: {
          user_id: eventId,
          message: str,
        },
      } as const
}
