import Immutable from 'immutable';

const MICROCASTLE_UPDATE_DATA = 'MICROCASTLE_UPDATE_DATA';
const MICROCASTLE_INSERT_DATA = 'MICROCASTLE_INSERT_DATA';

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

function reducer(state = new Immutable.Map({}), action) {
  switch (action.type) {

    case MICROCASTLE_UPDATE_DATA: {
      let {schemaName, entryID, attributeName, value} = action;
      const newValue = {[schemaName]: {[entryID]: {[attributeName]: value}}};
      return state.mergeDeep(newValue)
                  .setIn([schemaName, entryID, attributeName], value);
    }
    case MICROCASTLE_INSERT_DATA: {
      let {schemaName, entryID, entryValue} = action;
      const newValue = {[schemaName]: {[entryID]: entryValue}};
      return state.mergeDeep(newValue);
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
  },
  constants: {
    MICROCASTLE_UPDATE_DATA,
    MICROCASTLE_INSERT_DATA,
  },
};
