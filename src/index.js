import os from 'os'
import { Config } from '@/config'
import bootstrap from '@/bootstrap'
import { AuthenticateService } from '@/services/authenticate'
import { TokenModel } from '@/database/postgresql/models'
;

(async () => {
  /**
   * Set default authentication TokenModel to postgresql
   */
  AuthenticateService.setDefaultTokenModel(TokenModel)

  const app = await bootstrap()
  const port = Config.get('connection.port')
  app.listen(port, '0.0.0.0', () => console.log('App listening at http://%s:%s', os.hostname(), port))
})()
