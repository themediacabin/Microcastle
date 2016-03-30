import Editor from './Components/Editor.js'
import Connector from './Components/Connector.js'

import MicrocastleStore from './Store/Store'

export default {
  Microcastle: Connector,
  MicrocastleEditor: Editor,
  MicrocastleStore: MicrocastleStore,
}

export {
  Connector as Microcastle,
  Editor as MicrocastleEditor,
  MicrocastleStore as MicrocastleStore,
}
