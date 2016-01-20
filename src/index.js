import Editor from './Components/Editor.js';
import Connector from './Components/Connector.js';

import DataStore from './Store/Data.js';
import EditorStore from './Store/Editor.js';

export default {
  Microcastle: Connector,
  MicrocastleEditor: Editor,
  MicrocastleDataStore: DataStore,
  MicrocastleEditorStore: EditorStore,
};

export {
  Connector as Microcastle,
  Editor as MicrocastleEditor,
  DataStore as MicrocastleDataStore,
  EditorStore as MicrocastleEditorStore,
};
