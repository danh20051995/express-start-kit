import os from 'os'
import Config from 'config'
import { bootstrap } from '@/bootstrap'

const app = bootstrap()
const port = Config.get('connection.port')
app.listen(port, '127.0.0.1', () => console.log('App listening at http://%s:%s', os.hostname(), port))
