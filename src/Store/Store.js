import Immutable from 'immutable';
import {saveChangeState, validateTree, saveNewState} from './DiffTree';
import {changeViewValue} from './View';

const MICROCASTLE_CREATE_ADD_NEWSTATE = 'MICROCASTLE_CREATE_ADD_NEWSTATE';
const MICROCASTLE_MERGE_TREE = 'MICROCASTLE_MERGE_TREE';
const MICROCASTLE_EDITOR_EDIT_SINGLE = 'MICROCASTLE_EDITOR_EDIT_SINGLE';
const MICROCASTLE_EDITOR_EDIT_ENTRY = 'MICROCASTLE_EDITOR_EDIT_ENTRY';
const MICROCASTLE_EDITOR_EDIT_PART = 'MICROCASTLE_EDITOR_EDIT_PART';
const MICROCASTLE_EDITOR_CREATE_NEW = 'MICROCASTLE_EDITOR_CREATE_NEW';
const MICROCASTLE_EDITOR_CLOSE = 'MICROCASTLE_EDITOR_CLOSE';
const MICROCASTLE_REPORT_ERRORS = 'MICROCASTLE_REPORT_ERRORS';
const MICROCASTLE_REMOVE_NEWSTATE = 'MICROCASTLE_REMOVE_NEWSTATE';
const MICROCASTLE_EDITOR_CHANGE_VIEW = 'MICROCASTLE_EDITOR_CHANGE_VIEW';

const EDIT_SINGLE = 'EDIT_SINGLE';
const EDIT_PART = 'EDIT_PART';
const EDIT_ENTRY = 'EDIT_ENTRY';
const CREATE_NEW = 'CREATE_NEW';

export function editSingle(schemaName, entryID, attributeName) {
  return {
    type: MICROCASTLE_EDITOR_EDIT_SINGLE,
    schemaName,
    entryID,
    attributeName,
  };
}

export function editPart(schemaName, entryID, attributeName, part) {
  return {
    type: MICROCASTLE_EDITOR_EDIT_PART,
    schemaName,
    entryID,
    attributeName,
    part
  };
}

export function editEntry(schemaName, entryID) {
  return {
    type: MICROCASTLE_EDITOR_EDIT_ENTRY,
    schemaName,
    entryID,
  };
}

export function createNew(schemaName) {
  return {
    type: MICROCASTLE_EDITOR_CREATE_NEW,
    schemaName,
  };
}

export function close() {
  return {
    type: MICROCASTLE_EDITOR_CLOSE,
  };
}

export function reportErrors(errors) {
  return {
    type: MICROCASTLE_REPORT_ERRORS,
    errors
  };
}

export function mergeTree(tree) {
  return {
    type: MICROCASTLE_MERGE_TREE,
    tree
  };
}

export function changeView(view, value) {
  return {
    type: MICROCASTLE_EDITOR_CHANGE_VIEW,
    view,
    value,
  };
}

export function addNewState(id, createdType) {
  return {
    type: MICROCASTLE_CREATE_ADD_NEWSTATE,
    id,
    createdType,
  };
}

export function removeNewState(id) {
  return {
    type: MICROCASTLE_REMOVE_NEWSTATE,
    id,
  };
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
    const mergedNewState = getState().microcastle.setIn(['editor', 'tempState'], savedNewState.changeState)
                                                 .setIn(['editor', 'newState'], savedNewState.newState);
    const savedTree = await saveChangeState(mergedNewState, schema);
    return dispatch(mergeTree(savedTree));
  };
}

const initalState = Immutable.fromJS({
  data: {},
  editor: {},
});

export function reducer(state = initalState, action) {
  switch (action.type) {

    case MICROCASTLE_MERGE_TREE: {
      return state.mergeDeepIn(['data'], action.tree)
                  .setIn(['editor', 'tempState'], new Immutable.Map())
                  .setIn(['editor', 'newState'], new Immutable.List());
    }

    case MICROCASTLE_REMOVE_NEWSTATE: {
      const index = state.getIn(['editor', 'newState']).findIndex(e => e.id == action.id); 
      return state.deleteIn(['editor', 'newState', index]);
    }

    case MICROCASTLE_CREATE_ADD_NEWSTATE: {
      const val = Immutable.fromJS({
        id: action.id,
        type: action.createdType
      }); 
      return state.updateIn(['editor', 'newState'], l => l.push(val));
    }

    case MICROCASTLE_EDITOR_EDIT_SINGLE: {
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
      const newEditor = state.get('editor').set('open', true)
                                           .set('action', EDIT_PART)
                                           .set('schema', action.schemaName)
                                           .set('entry', action.entryID)
                                           .set('attribute', action.attributeName)
                                           .set('part', action.part)
                                           .set('view', Immutable.fromJS({
                                             state: 'change',
                                             type: action.schemaName,
                                             entry: action.entryID,
                                             attribute: action.attributeName,
                                             part: action.part,
                                           }))
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

    default:
      return state;
  }
}

export default {
  reducer: reducer,
  actions: {
    editSingle,
    editEntry,
    editPart,
    createNew,
    close,
    save,
    changeView,
    addNewState,
  },
};
