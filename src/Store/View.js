import R from 'ramda';

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

export const getNewViewEntry = (microcastleState, view) => {
  const newState = microcastleState.getIn(['editor', 'newState']);
  const entry = newState.find(v => v.get('id') == view.get('entry'));
  return entry;
};

export const changeViewValue = (microcastleState, view, value) => {

  const parts = view.get('part') || [];

  if (view.get('state') == 'change') {
    const pathBase = [view.get('type'), view.get('entry'), view.get('attribute')];
    const path = [...pathBase, ...parts];

    let ret = microcastleState;

    if (!microcastleState.getIn(['editor', 'tempState', ...pathBase])) {
      const before = microcastleState.getIn(['data', ...pathBase]);
      if (before) {
        ret = ret.setIn(['editor', 'tempState', ...pathBase], before);
      }
    }

    return ret.setIn(['editor', 'tempState', ...path], value);
  }

  if (view.get('state') == 'new') {
    const newState = microcastleState.getIn(['editor', 'newState']);
    const index = newState.findIndex(v => v.get('id') == view.get('entry'));
    return microcastleState.setIn(['editor', 'newState', index, 'data', view.get('attribute'), ...parts], value); 
  }

};

export const getSchemaFromView = (schema, view) => {

  const type = schema[view.get('type')];
  const attributes = type['attributes'];
  if (!attributes) return type;
  const attribute = attributes[view.get('attribute')]; 
  if (!attribute) return type;
  if (!view.has('part')) return attribute;
  return R.reduce((a, l) => {
    if (a['type'] == 'array') return a['subtype'];
    if (a['type'] == 'flex') return a['flexes'][l];
    return l.get(a);
  }, attribute, view.get('part'));

};

export const getAllAttributesForEntry = (schema, view) => {
  const scheme = getSchemaFromView(schema, view);
  return R.pipe(
    R.keys,
    R.map(key => view.set('attribute', key))
  )(scheme.attributes);
};

