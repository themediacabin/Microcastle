import Editor from './Components/Editor.js'
import Connector from './Components/Connector.js'

import MicrocastleStore from './Store/Store'

export default {
  MicrocastleEditor: Editor,
  MicrocastleStore: MicrocastleStore,
  MicrocastleConnect: Connector,
}

export {
  Connector as MicrocastleConnect,
  Editor as MicrocastleEditor,
  MicrocastleStore as MicrocastleStore,
}
