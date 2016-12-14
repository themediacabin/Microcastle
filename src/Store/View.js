import Immutable from 'immutable';


export const getViewValue = (microcastleState, view) => {

  const parts = view.get('part') || [];

  if (view.get('state') == 'change') {
    const path = [view.get('type'), view.get('entry'), view.get('attribute'), ...parts];

    const x = Symbol();
    const saved = microcastleState.getIn(['data', ...path]);
    const changeState = microcastleState.getIn(['editor', 'tempState', ...path], x);

    return changeState == x ? saved : changeState;
  }

  if (view.get('state') == 'new') {
    const newState = microcastleState.getIn(['editor', 'newState']);
    const entry = newState.find(v => v.get('id') == view.get('entry'));
    if (!entry) return undefined;
    return entry.getIn(['data', view.get('attribute'), ...parts]); 
  }

};

export const changeViewValue = (microcastleState, view, value) => {

  const parts = view.get('part') || [];

  if (view.get('state') == 'change') {
    const path = [view.get('type'), view.get('entry'), view.get('attribute'), ...parts];

    return microcastleState.setIn(['editor', 'tempState', ...path], value);
  }

  if (view.get('state') == 'new') {
    const newState = microcastleState.getIn(['editor', 'newState']);
    const index = newState.findIndex(v => v.get('id') == view.get('entry'));
    return microcastleState.setIn(['editor', 'newState', index, 'data', view.get('attribute'), ...parts], value); 
  }

}

export const getSchemaFromView = (schema, view) => {

  const type = schema[view.get('type')];
  const attributes = type['attributes'];
  if (!attributes) return type;
  const attribute = attributes[view.get('attribute')]; 
  if (!attribute) return type;
  return attribute;

}

