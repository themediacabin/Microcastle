
import Editor from './Components/Editor.js';
import Connector from './Components/Connector.js';

import MicrocastleStore from './Store/Store';
import Button from './Components/Button';

export default {
  MicrocastleEditor: Editor,
  MicrocastleStore: MicrocastleStore,
  MicrocastleConnect: Connector,
  Button: Button,
};

export {
  Connector as MicrocastleConnect,
  Editor as MicrocastleEditor,
  MicrocastleStore as MicrocastleStore,
  Button as Button,
};
