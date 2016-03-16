import Editor from './Components/Editor.js';
import Connector from './Components/Connector.js';

import DataStore from './Store/Store.js';
import EditorStore from './Store/Editor.js';

export default {
  Microcastle: Connector,
  MicrocastleEditor: Editor,
  MicrocastleStore: DataStore,
};

export {
  Connector as Microcastle,
  Editor as MicrocastleEditor,
  DataStore as MicrocastleStore,
};
