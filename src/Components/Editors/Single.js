import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import _ from 'lodash';

import Store from '../../Store/Store';
import EditorFrame from '../EditorFrame';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';


class SingleEditor extends React.Component {
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
            return self.props.dispatch(action);
        });
    }
  }

  onChange(value) {
    this.props.changeTempState(value);
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
    const EditorComponent = DataTypes.stringToComponent(schema.type);

    return (
      <ItemFrame title={attributeName}>
        <EditorComponent onChange={this.onChange.bind(this)}
                         value={this.getCurrentValue()}
                         options={schema}
                         microcastleStore={this.props.microcastleStore}
                         microcastleSchema={this.props.microcastleSchema}
                         dispatch={this.props.dispatch} />
     </ItemFrame>
    );
  }
}


export default SingleEditor
