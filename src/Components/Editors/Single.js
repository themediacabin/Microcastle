import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import _ from 'lodash';

import DataStore from '../../Store/Data';
import EditorStore from '../../Store/Editor';
import EditorFrame from '../EditorFrame';

import DataTypes from '../DataTypes';


class Editor extends React.Component {
  onSubmit() {
    let self = this;
    const entryID = self.props.microcastleEditor.get('entry');
    const attributeSchema = this.getAttributeSchema();
    if (!!attributeSchema.onChange){
      attributeSchema.onChange(
            this.props.microcastleEditor.get('tempState'), {id: entryID})
        .then((edited) => {
            const action = DataStore.actions.updateData(
              self.props.microcastleEditor.get('schema'),
              entryID,
              self.props.microcastleEditor.get('attribute'),
              edited
            );
            return self.props.dispatch(action);
        });
    }

    const action = EditorStore.actions.close();
    return this.props.dispatch(action);
  }

  onCancel() {
    const action = EditorStore.actions.close();
    return this.props.dispatch(action);
  }

  onChange(value) {
    const action = EditorStore.actions.setTempState(value);
    return this.props.dispatch(action);
  }

  getCurrentValue() {
    return this.props.microcastleEditor.get('tempState', '');
  }

  getAttributeSchema() {
    const attributeName = this.props.microcastleEditor.get('attribute');
    return this.props.schema.attributes[attributeName];
  }

  render() {
    const attributeName = this.props.microcastleEditor.get('attribute');
    const schema = this.getAttributeSchema();
    const entryID = this.props.microcastleEditor.get('entry');
    const EditorComponent = DataTypes.stringToComponent(schema.type);

    return (
      <EditorFrame
      onSubmit={this.onSubmit.bind(this)}
      onCancel={this.onCancel.bind(this)}
      title="Editing Single"
      open={true}>
        <h2>{attributeName}</h2>
        <EditorComponent onChange={this.onChange.bind(this)}
                         value={this.getCurrentValue()}
                         options={schema.options} />
     </EditorFrame>
    );
  }

}

const connectReducers = connect((state) => {
  return {
    microcastleEditor: state.microcastleEditor,
  };
});

export default connectReducers(Editor);
