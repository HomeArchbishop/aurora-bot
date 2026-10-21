import type { GroupMessageEvent, MessageEvent, OnebotEvent, PrivateMessageEvent } from 'aurorax'

export type IdLike = string | number | undefined

export const isMessage = (event: OnebotEvent): event is MessageEvent =>
  event.post_type === 'message'

export const isUser = (event: OnebotEvent, userId: IdLike): event is MessageEvent =>
  isMessage(event) && userId !== undefined && event.user_id === Number(userId)

export const isPrivateFrom = (event: OnebotEvent, userId: IdLike): event is PrivateMessageEvent =>
  isMessage(event) &&
  event.message_type === 'private' &&
  userId !== undefined &&
  event.user_id === Number(userId)

export const isGroupIn = (event: OnebotEvent, groupIds: IdLike[]): event is GroupMessageEvent => {
  if (!isMessage(event) || event.message_type !== 'group') {
    return false
  }
  const ids = groupIds.filter((id): id is string | number => id !== undefined).map(String)
  return ids.includes(`${event.group_id}`)
}

/** private ∈ privateIds 或 group ∈ groupIds */
export const allowChannel = (
  event: OnebotEvent,
  {
    private: privateIds = [],
    groups: groupIds = [],
  }: {
    private?: IdLike[]
    groups?: IdLike[]
  },
): event is MessageEvent =>
  privateIds.some(id => isPrivateFrom(event, id)) ||
  (groupIds.length > 0 && isGroupIn(event, groupIds))
