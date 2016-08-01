import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';

import Store from '../../Store/Store';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';

const checkForErrors = (results) => {
      const flatResults = _.flattenDeep([results]);
      let error = null;
      _.forEach(flatResults, (result) => {
        if (_.has(result, 'error')) error = result.error;
      });
      return error != null;
};

class PartEditor extends React.Component {
  onSubmit() {
    let self = this;
    const entryID = self.props.microcastleStore.get('editor').get('entry');
    const attributeSchema = this.getAttributeSchema();
    if (attributeSchema.onChange){
      const save = this._editor.onSave();
      return save.then(checkForErrors).then((err) => new Promise((resolve, reject) => {
        if (err) return reject('Not Saved');
        attributeSchema.onChange(
            this.props.microcastleStore.get('editor').get('tempState'), {id: entryID})
        .then((edited) => {
            const action = Store.actions.updateData(
              self.props.microcastleStore.get('editor').get('schema'),
              entryID,
              self.props.microcastleStore.get('editor').get('attribute'),
              edited
            );
            self.props.dispatch(action);
            if (this.props.closeEditor != undefined) this.props.closeEditor();
        });
      })).catch(() => {});
    }
  }

  onChange(value) {
    const prev = this.props.microcastleStore.get('editor').get('tempState', '');
    const part = this.props.microcastleStore.get('editor').get('part');

    this.props.changeTempState(prev.setIn(part, value));
  }

  getEditingValue() {
    const part = this.props.microcastleStore.get('editor').get('part');
    return this.props.microcastleStore.get('editor').get('tempState').getIn(part);
  }

  getEditingValueType() {
    let parts = Immutable.fromJS(this.props.microcastleStore.get('editor').get('part'));
    let currentSchema = this.getAttributeSchema();
    let solved = [];
    while (parts.count() > 0) {
      const currentPart = parts.first();
      parts = parts.rest();

      if (currentSchema.type == 'array') {
        currentSchema = currentSchema.subtype;
      } else if (currentSchema.type == 'flex') {
        const flexType = this.props.microcastleStore.get('editor').get('tempState').getIn(solved).get('_flex_type');
        currentSchema = currentSchema.flexes[flexType][currentPart];
      }
      solved.push(currentPart);
    }
    return currentSchema;
  }

  getCurrentValue() {
    return this.props.microcastleStore.get('editor').get('tempState', '');
  }

  getAttributeSchema() {
    const attributeName = this.props.microcastleStore.get('editor').get('attribute');
    return this.props.schema.attributes[attributeName];
  }

  render() {
    const attributeName = this.props.microcastleStore.get('editor').get('attribute');
    const EditorComponent = DataTypes.stringToComponent(this.getEditingValueType().type);

    return (
      <ItemFrame title={attributeName}>
        <EditorComponent ref={(r) => this._editor = r}
                         onChange={this.onChange.bind(this)}
                         value={this.getEditingValue()}
                         options={this.getEditingValueType()}
                         microcastleStore={this.props.microcastleStore}
                         microcastleSchema={this.props.microcastleSchema}
                         dispatch={this.props.dispatch} />
     </ItemFrame>
    );
  }
}


export default PartEditor;
