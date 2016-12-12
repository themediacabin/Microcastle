import Immutable from 'immutable';
import {saveChangeState, validateTree, saveNewState} from './DiffTree';
import {changeViewValue} from './View';

const MICROCASTLE_UPDATE_DATA = 'MICROCASTLE_UPDATE_DATA';
const MICROCASTLE_MERGE_TREE = 'MICROCASTLE_MERGE_TREE';
const MICROCASTLE_INSERT_DATA = 'MICROCASTLE_INSERT_DATA';
const MICROCASTLE_DELETE_ENTRY = 'MICROCASTLE_DELETE_ENTRY';
const MICROCASTLE_EDITOR_EDIT_SINGLE = 'MICROCASTLE_EDITOR_EDIT_SINGLE';
const MICROCASTLE_EDITOR_EDIT_ENTRY = 'MICROCASTLE_EDITOR_EDIT_ENTRY';
const MICROCASTLE_EDITOR_EDIT_PART = 'MICROCASTLE_EDITOR_EDIT_PART';
const MICROCASTLE_EDITOR_CREATE_NEW = 'MICROCASTLE_EDITOR_CREATE_NEW';
const MICROCASTLE_EDITOR_CLOSE = 'MICROCASTLE_EDITOR_CLOSE';
const MICROCASTLE_EDITOR_SET_TEMP_STATE = 'MICROCASTLE_EDITOR_SET_TEMP_STATE';
const MICROCASTLE_REPORT_ERRORS = 'MICROCASTLE_REPORT_ERRORS';
const MICROCASTLE_EDITOR_CHANGE_VIEW = 'MICROCASTLE_EDITOR_CHANGE_VIEW';

const EDIT_SINGLE = 'EDIT_SINGLE';
const EDIT_PART = 'EDIT_PART';
const EDIT_ENTRY = 'EDIT_ENTRY';
const CREATE_NEW = 'CREATE_NEW';

function editSingle(schemaName, entryID, attributeName) {
  return {
    type: MICROCASTLE_EDITOR_EDIT_SINGLE,
    schemaName,
    entryID,
    attributeName,
  };
}

function editPart(schemaName, entryID, attributeName, part) {
  return {
    type: MICROCASTLE_EDITOR_EDIT_PART,
    schemaName,
    entryID,
    attributeName,
    part
  };
}

function editEntry(schemaName, entryID) {
  return {
    type: MICROCASTLE_EDITOR_EDIT_ENTRY,
    schemaName,
    entryID,
  };
}

function createNew(schemaName) {
  return {
    type: MICROCASTLE_EDITOR_CREATE_NEW,
    schemaName,
  };
}

function edit(schemaName, entryID, attributeName) {
  if (entryID == null) {
    createNew(schemaName);
  } else if (attributeName == null) {
    editEntry(schemaName, entryID);
  } else {
    editSingle(schemaName, entryID, attributeName);
  }
}

function close() {
  return {
    type: MICROCASTLE_EDITOR_CLOSE,
  };
}


function setTempState(state) {
  return {
    type: MICROCASTLE_EDITOR_SET_TEMP_STATE,
    state
  };
}

function updateData(schemaName, entryID, attributeName, value) {
  return {
    type: MICROCASTLE_UPDATE_DATA,
    schemaName,
    entryID,
    attributeName,
    value
  };
}

function insertData(schemaName, entryID, entryValue) {
  return {
    type: MICROCASTLE_INSERT_DATA,
    schemaName,
    entryID,
    entryValue
  };
}

function deleteEntry(schemaName, entryID) {
  return {
    type: MICROCASTLE_DELETE_ENTRY,
    schemaName,
    entryID
  };
}

function reportErrors(errors) {
  return {
    type: MICROCASTLE_REPORT_ERRORS,
    errors
  };
}

function mergeTree(tree) {
  return {
    type: MICROCASTLE_MERGE_TREE,
    tree
  };
}

function deleteEntry(schemaName, entryID) {
  return {
    type: MICROCASTLE_DELETE_ENTRY,
    schemaName,
    entryID
  };
}

export function changeView(view, value) {
  return {
    type: MICROCASTLE_EDITOR_CHANGE_VIEW,
    view,
    value,
  };
}
export function saveNew() {

}

export function save(schema) {
  return async (dispatch, getState) => {
    const tempState = getState().microcastle.get('editor').get('tempState');
    const newState = getState().microcastle.get('editor').get('newState');
    const validationErrors = validateTree(schema, tempState);
    if (validationErrors.length > 0) {
      return dispatch(reportErrors(validationErrors));
    }
    const savedNewState = await saveNewState(newState, tempState, schema);
    const savedTree = await saveChangeState(savedNewState.changeState, getState().microcastle.get('data'), schema);
    return dispatch(mergeTree(savedTree));
  }
}

const initalState = Immutable.fromJS({
  data: {},
  editor: {},
});

function reducer(state = initalState, action) {
  switch (action.type) {

    case MICROCASTLE_MERGE_TREE: {
      return state.mergeDeepIn(['data'], action.tree);
    }

    case MICROCASTLE_UPDATE_DATA: {
      let {schemaName, entryID, attributeName, value} = action;
      const newValue = {[schemaName]: {[entryID]: {[attributeName]: value}}};
      const newData = state.get('data').mergeDeep(newValue)
                                       .setIn([schemaName, entryID, attributeName], value);
      return state.set('data', newData);
    }

    case MICROCASTLE_INSERT_DATA: {
      let {schemaName, entryID, entryValue} = action;
      const newValue = {[schemaName]: {[entryID]: entryValue}};
      const newData = state.get('data').mergeDeep(newValue);
      return state.set('data', newData);
    }

    case MICROCASTLE_DELETE_ENTRY: {
      let {schemaName, entryID} = action;
      return state.deleteIn(['data', schemaName, entryID]);
    }

    case MICROCASTLE_EDITOR_EDIT_SINGLE: {
      const currentState = state.get('data').get(action.schemaName)
                                .get(action.entryID).get(action.attributeName);
      const newEditor = state.get('editor').set('open', true)
                                           .set('action', EDIT_SINGLE)
                                           .set('schema', action.schemaName)
                                           .set('entry', action.entryID)
                                           .set('view', Immutable.fromJS({
                                             state: 'change',
                                             type: action.schemaName,
                                             entry: action.entryID,
                                             attribute: action.attributeName,
                                           }))
                                           .set('attribute', action.attributeName)
                                           .set('tempState', new Immutable.Map())
                                           .set('newState', new Immutable.List());
      return state.set('editor', newEditor);
    }

    case MICROCASTLE_EDITOR_EDIT_PART: {
      const currentState = state.get('data').get(action.schemaName).get(action.entryID).get(action.attributeName);
      const newEditor = state.get('editor').set('open', true)
                                           .set('action', EDIT_PART)
                                           .set('schema', action.schemaName)
                                           .set('entry', action.entryID)
                                           .set('attribute', action.attributeName)
                                           .set('part', action.part)
                                           .set('newState', new Immutable.List())
                                           .set('tempState', new Immutable.Map());
      return state.set('editor', newEditor);
    }

    case MICROCASTLE_EDITOR_EDIT_ENTRY: {
      const newEditor = state.get('editor').set('open', true)
                                           .set('view', Immutable.fromJS({
                                             state: 'change',
                                             type: action.schemaName,
                                             entry: action.entryID,
                                           }))
                                           .set('action', EDIT_ENTRY)
                                           .set('schema', action.schemaName)
                                           .set('newState', new Immutable.List())
                                           .set('entry', action.entryID)
                                           .set('tempState', new Immutable.Map());
      return state.set('editor', newEditor);
    }


    case MICROCASTLE_EDITOR_CREATE_NEW: {
      const newEditor = state.get('editor').set('open', true)
                                           .set('action', CREATE_NEW)
                                           .set('view', Immutable.fromJS({
                                             state: 'new',
                                             type: action.schemaName,
                                             entry: 1,
                                           }))
                                           .set('newState', new Immutable.fromJS([{id: 1, type: action.schemaName}]))
                                           .set('schema', action.schemaName)
                                           .set('tempState', new Immutable.Map());
      return state.set('editor', newEditor);
    }

    case MICROCASTLE_EDITOR_CLOSE: {
      return state.setIn(['editor', 'open'], false);
    }

    case MICROCASTLE_EDITOR_CHANGE_VIEW: {
      return changeViewValue(state, action.view, action.value);
    }

    case MICROCASTLE_EDITOR_SET_TEMP_STATE: {
      const editor = state.get('editor');
      const editorAction = editor.get('action');
      if (editorAction == EDIT_ENTRY)
        return state.setIn(['editor', 'tempState', editor.get('schema'), editor.get('entry')], action.state);
      if (editorAction == EDIT_SINGLE) {
        return state.setIn(['editor', 'tempState', editor.get('schema'), editor.get('entry'), editor.get('attribute')], action.state);
      }
      return state;
    }

    default:
      return state;
  }
}

export default {
  reducer: reducer,
  actions: {
    updateData,
    insertData,
    editSingle,
    editEntry,
    editPart,
    createNew,
    close,
    edit,
    setTempState,
    deleteEntry,
    save,
    changeView,
  },
  constants: {
    MICROCASTLE_UPDATE_DATA,
    MICROCASTLE_INSERT_DATA,
    MICROCASTLE_EDITOR_EDIT_SINGLE,
    MICROCASTLE_EDITOR_EDIT_PART,
    MICROCASTLE_EDITOR_CREATE_NEW,
    MICROCASTLE_EDITOR_CLOSE,
    MICROCASTLE_EDITOR_SET_TEMP_STATE,
    EDIT_SINGLE,
    CREATE_NEW,
  },
};
