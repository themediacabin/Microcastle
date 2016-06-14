import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import _ from 'lodash';

import Store from '../../Store/Store';
import EditorFrame from '../EditorFrame';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';


class PartEditor extends React.Component {
  onSubmit() {
    let self = this;
    const entryID = self.props.microcastleStore.get('editor').get('entry');
    const attributeSchema = this.getAttributeSchema();
    if (!!attributeSchema.onChange){
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
    const schema = this.getAttributeSchema();
    let parts = Immutable.fromJS(this.props.microcastleStore.get('editor').get('part'));
    let currentSchema = this.getAttributeSchema();
    let solved = [];
    while (parts.count() > 0) {
      const currentPart = parts.first();
      parts = parts.rest();

      if (currentSchema.type == 'array') {
        currentSchema = currentSchema.subtype
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
    const schema = this.getAttributeSchema();
    const entryID = this.props.microcastleStore.get('editor').get('entry');
    const EditorComponent = DataTypes.stringToComponent(this.getEditingValueType().type);

    return (
      <ItemFrame title={attributeName}>
        <EditorComponent onChange={this.onChange.bind(this)}
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
