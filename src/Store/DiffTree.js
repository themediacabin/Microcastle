import I from 'immutable';
import R from 'ramda';
import {stringToComponent} from '../Components/DataTypes';

export const validateTree = (schema, tree) => {
  let errors = [];

  tree.forEach((type, typeName) => {
    type.forEach((entry, entryName) => {
      const entrySchema = schema[typeName]['attributes'];
      new I.Map(entrySchema).forEach((_, attributeName) => {
        const scheme = schema[typeName]['attributes'][attributeName];
        const type = scheme.type;
        const dataType = stringToComponent(type);
        const data = entry.get(attributeName);
        const ourErrors = dataType.validate(scheme, data);
        errors = errors.concat(ourErrors);
      });
    });
  });

  return errors;
}

export const saveEntry = async (schema, editor) => {
  const typeName = editor.get('schema');
  const entryID = editor.get('entry');

  const value = editor.getIn(['tempState', typeName, entryID]);
  const saveFunction = schema[typeName]['onEdit'];

  const saved = await saveFunction(value, {id: entryID});
  return editor.get('tempState').mergeIn([typeName, entryID], saved); 
}

export const saveTree = async (schema, editor) => {
  if (editor.get('action') == 'EDIT_SINGLE') {
    return await saveEntry(schema, editor);
  }
  return '';
}

