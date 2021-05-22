import RSMQ from 'rsmq'
import { Config } from '@/config'
import { RedisService } from '@/services/redis'

export const RSMQService = new RSMQ({
  client: RedisService,
  ns: Config.get('name')
})

RSMQService
  .createQueueAsync({ qname: 'notification' })
  .then((...args) => {
    console.log(args)
  })
  .catch(error => {
    if (error.name !== 'queueExists') {
      console.error(error)
    }
  })

RSMQService.sendMess = async ({ qname, message, delay, notification }) => {
  const queueId = await RSMQService.sendMessageAsync({ qname, message, delay })
  if (notification) {
    notification.mQueueId = queueId
    notification.save()
  }

  return queueId
}

RSMQService.deleteMess = ({ qname, id }) => RSMQService.deleteMessageAsync({ qname, id })

export default RSMQService
