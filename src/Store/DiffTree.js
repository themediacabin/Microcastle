import I from 'immutable';
import R from 'ramda';
import {stringToComponent} from '../Components/DataTypes';

function promiseProps(object) {
    let promisedProperties = [];
    const objectKeys = object.keySeq();
    objectKeys.forEach((key) => promisedProperties.push(object.get(key)));

    return Promise.all(promisedProperties)
                  .then((resolvedValues) => {
                    return I.fromJS(resolvedValues.reduce((resolvedObject, property, index) => {
                      return resolvedObject.set(objectKeys.get(index), property);
                    }, new I.Map()));
           });

}



export const validateEntry = (entrySchema, entry) => {
  let errors = [];

  new I.Map(entrySchema['attributes']).forEach((_, attributeName) => {
    const scheme = entrySchema['attributes'][attributeName];
    const type = scheme.type;
    const dataType = stringToComponent(type);
    const data = entry.get(attributeName);
    const ourErrors = dataType.validate(scheme, data);
    errors = errors.concat(ourErrors);
  });

  return errors;
}

export const validateTree = (schema, tree) => {
  let errors = [];

  tree.forEach((type, typeName) => {
    type.forEach((entry, entryName) => {
      const entrySchema = schema[typeName];
      const entryErrors = validateEntry(entrySchema, entry);
      errors = errors.concat(entryErrors);
    });
  });

  return errors;
}

export const saveChangeState = async (changeState, originalState, schema) => {
  const changed = await promiseProps(changeState.map(async (type, typeName) => 
    promiseProps(type.map(async (entry, entryName) => {
      const merged = originalState.getIn([typeName, entryName], new I.Map())
                                  .merge(changeState.getIn([typeName, entryName]));
      const saveFn = schema[typeName]['onEdit']; 
      return await saveFn(merged, {id: entryName});
    }))
  ));
  return originalState.mergeDeep(changed);
}

export const saveIndividualNew = async (state, changeState, schema) => {
  const type = state.get('type');  
  const saveFn = schema[type]['onNew'];
  const resolved = await saveFn(state.get('data').toJS());

  const entryID = Object.keys(resolved)[0];
  const value = Object.values(resolved)[0];

  return {
    newState: I.fromJS({
      id: state.get('id'),
      created: true,
      entryID,
    }),
    changeState: changeState.setIn([type, entryID], I.fromJS(value)),
  };
}

export const saveNewState = async (newState, changeState, schema) => {
  if(newState == null) {
    return {
      newState: undefined,
      changeState: changeState
    }
  }
  
  let newChangeState = changeState;
  let newNewState = new I.List();

  for (let i = 0; i < newState.size; i++) {
    const saved = await saveIndividualNew(newState.get(i), newChangeState, schema);  
    newChangeState = saved.changeState;
    newNewState = newNewState.set(i, saved.newState);
  }
  
  return {
    newState: newNewState,
    changeState: newChangeState 
  };
}

