import Immutable from 'immutable';

const MICROCASTLE_EDITOR_EDIT_SINGLE = 'MICROCASTLE_EDITOR_EDIT_SINGLE';
const MICROCASTLE_EDITOR_EDIT_ENTRY = 'MICROCASTLE_EDITOR_EDIT_ENTRY';
const MICROCASTLE_EDITOR_CREATE_NEW = 'MICROCASTLE_EDITOR_CREATE_NEW';
const MICROCASTLE_EDITOR_CLOSE = 'MICROCASTLE_EDITOR_CLOSE';
const MICROCASTLE_EDITOR_SET_TEMP_STATE = 'MICROCASTLE_EDITOR_SET_TEMP_STATE';

const EDIT_SINGLE = 'EDIT_SINGLE';
const EDIT_ENTRY = 'EDIT_ENTRY';
const CREATE_NEW = 'CREATE_NEW';

function editSingle(schemaName, entryID, attributeName, currentValue) {
  return {
    type: MICROCASTLE_EDITOR_EDIT_SINGLE,
    schemaName,
    entryID,
    attributeName,
    currentValue
  };
}

function editEntry(schemaName, entryID, currentValue) {
  return {
    type: MICROCASTLE_EDITOR_EDIT_ENTRY,
    schemaName,
    entryID,
    currentValue
  };
}

function createNew(schemaName) {
  return {
    type: MICROCASTLE_EDITOR_CREATE_NEW,
    schemaName,
  };
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


function reducer(state = new Immutable.Map({}), action) {
  switch (action.type) {

    case MICROCASTLE_EDITOR_EDIT_SINGLE:
      return state.set('open', true)
                  .set('action', EDIT_SINGLE)
                  .set('schema', action.schemaName)
                  .set('entry', action.entryID)
                  .set('attribute', action.attributeName)
                  .set('tempState', action.currentValue);

    case MICROCASTLE_EDITOR_EDIT_ENTRY:
      return state.set('open', true)
                  .set('action', EDIT_ENTRY)
                  .set('schema', action.schemaName)
                  .set('entry', action.entryID)
                  .set('tempState', action.currentValue);

    case MICROCASTLE_EDITOR_CREATE_NEW:
      return state.set('open', true).set('action', CREATE_NEW)
                  .set('schema', action.schemaName).set('tempState', '');

    case MICROCASTLE_EDITOR_CLOSE:
      return state.set('open', false);

    case MICROCASTLE_EDITOR_SET_TEMP_STATE:
      return state.set('tempState', action.state);

    default:
      return state;
  }
}

export default {
  reducer: reducer,
  actions: {
    editSingle,
    editEntry,
    createNew,
    close,
    setTempState,
  },
  constants: {
    MICROCASTLE_EDITOR_EDIT_SINGLE ,
    MICROCASTLE_EDITOR_CREATE_NEW,
    MICROCASTLE_EDITOR_CLOSE,
    MICROCASTLE_EDITOR_SET_TEMP_STATE,
    EDIT_SINGLE,
    CREATE_NEW,
  },
};
