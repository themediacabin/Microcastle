import I from "immutable";
import R from "ramda";

import { stringToComponent } from "../Components/DataTypes";
import { getSchemaFromView, changeViewValue } from "./View";

function promiseProps(object) {
  let promisedProperties = [];
  const objectKeys = object.keySeq();
  objectKeys.forEach(key => promisedProperties.push(object.get(key)));

  return Promise.all(promisedProperties).then(resolvedValues => {
    return I.fromJS(
      resolvedValues.reduce(
        (resolvedObject, property, index) => {
          return resolvedObject.set(objectKeys.get(index), property);
        },
        new I.Map()
      )
    );
  });
}

export const validateEntry = (entrySchema, entry) => {
  let errors = [];

  new I.Map(entrySchema["attributes"]).forEach((_, attributeName) => {
    const scheme = entrySchema["attributes"][attributeName];
    const type = scheme.type;
    const dataType = stringToComponent(type);
    const data = entry.get(attributeName);
    const ourErrors = dataType.validate(scheme, data);
    errors = errors.concat(ourErrors);
  });

  return errors;
};

export const validateTree = (schema, tree) => {
  let errors = [];

  tree.forEach((type, typeName) => {
    type.forEach(entry => {
      const entrySchema = schema[typeName];
      const entryErrors = validateEntry(entrySchema, entry);
      errors = errors.concat(entryErrors);
    });
  });

  return errors;
};

const mapEachEntry = async (state, fn) => {
  return promiseProps( state.map( async (type, typeName) => {
    return promiseProps( type.map(async (entry, entryName) => {
      return await fn(typeName, entryName, entry);
    }));
  }));
};

export const saveChangeState = async (microcastle, schema) => {
  const changeState = microcastle.getIn([ "editor", "tempState" ], new I.Map());
  const originalState = microcastle.get("data", new I.Map());

  const beforeSaved = await mapEachEntry(changeState, async (typeName, entryName) => {
    const changedFixed = changeState.getIn([ typeName, entryName ]).map((v, k) => {
      const view = I.fromJS({
        state: "change",
        type: typeName,
        entry: entryName,
        attribute: k
      });
      const allNested = getAllNested(schema, microcastle, view);

      const savedMC = R.reduce((mc, nv) => {
        const type = getSchemaFromView(schema, microcastle, nv).type;
        const beforeSave = stringToComponent(type).beforeSave;
        if (!beforeSave) return mc;
        return changeViewValue(mc, nv, beforeSave(mc, nv));
      },  microcastle, allNested);

      if (!originalState.getIn([typeName, entryName, k], false)) 
          return savedMC.getIn(["editor", "tempState", typeName, entryName, k]);

      return originalState.getIn([typeName, entryName], new I.Map())
        .merge(
          savedMC.getIn(["editor", "tempState", typeName, entryName])
        ).get(k);
    });
    return originalState.getIn([typeName, entryName], new I.Map()).merge(changedFixed);
  });

  const changed = await mapEachEntry(beforeSaved, async (typeName, entryName, entry) => {
    const saveFn = schema[typeName]["onEdit"];
    return I.fromJS(await saveFn(entry.toJS(), { id: entryName }));
  });

  return originalState.mergeDeep(changed);
};

export const saveIndividualNew = async (state, changeState, schema) => {
  const type = state.get("type");

  const saveFn = schema[type]["onNew"];
  const resolved = await saveFn(state.get("data").toJS());

  const entryID = Object.keys(resolved)[0];
  const value = Object.values(resolved)[0];

  return {
    newState: I.fromJS({ id: state.get("id"), created: true, entryID }),
    changeState: changeState.setIn([ type, entryID ], I.fromJS(value))
  };
};

export const saveNewState = async (newState, changeState, schema) => {
  if (newState == null) {
    return { newState: undefined, changeState: changeState };
  }

  let newChangeState = changeState;
  let newNewState = new I.List();

  for (let i = 0; i < newState.size; i++) {
    const saved = await saveIndividualNew(
      newState.get(i),
      newChangeState,
      schema
    );

    newChangeState = saved.changeState;
    newNewState = newNewState.set(i, saved.newState);
  }

  return { newState: newNewState, changeState: newChangeState };
};

export const getAllNested = (schema, microcastle, view) => {
  const getChildren = stringToComponent(
    getSchemaFromView(schema, microcastle, view).type
  ).getChildren;
  if (!getChildren)
    return [ view ];
  const children = getChildren(schema, view, microcastle);
  const childrenNested = R.map(
    child => getAllNested(schema, microcastle, child),
    children
  );
  return R.concat([ view ], R.flatten(childrenNested));
};

export const removeNested = (dispatch, schema, microcastle, view) => {
  const allChildren = getAllNested(schema, microcastle, view);
  R.map(child => {
    const dataType = getSchemaFromView(schema, microcastle, child).type;
    const DataComponent = stringToComponent(dataType);
    if (DataComponent.onRemoved)
      DataComponent.onRemoved(dispatch, microcastle, child);
  }, allChildren);
};

export const callOnDelete = async (schema, deleteList) => {
  await Promise.all(deleteList.map(async (deleteItem) => {
    await schema[deleteItem.get('type')]['onDelete']({}, {id: deleteItem.entry});
  }).toJS());
};


export const deleteState = (originalState, deleteList) => {
  return originalState.map((type, typeName) => {
    return type.filter((entry, entryName) => {
      return !deleteList.contains(I.fromJS({type: typeName, entry: entryName}));
    });
  });
};


