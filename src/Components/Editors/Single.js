import React from 'react';
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

class SingleEditor extends React.Component {
  onSubmit() {
    this.props.dispatch(Store.actions.save(this.props.microcastleSchema));
  }

  onChange(value) {
    this.props.changeTempState(value);
  }

  getCurrentValue() {
    const editor = this.props.microcastleStore.get('editor');
    const tmpVal = editor.getIn('tempState', editor.get('schema'), editor.get('entry'), editor.get('attribute'));
    const savVal = this.props.microcastleStore.getIn('data', editor.get('schema'), editor.get('entry'), editor.get('attribute'));
    return tmpVal || savVal;
  }

  getAttributeSchema() {
    const attributeName = this.props.microcastleStore.get('editor').get('attribute');
    return this.props.schema.attributes[attributeName];
  }

  render() {
    const attributeName = this.props.microcastleStore.get('editor').get('attribute');
    const schema = this.getAttributeSchema();
    const EditorComponent = DataTypes.stringToComponent(schema.type);

    return (
      <ItemFrame title={schema.name || attributeName}>
        <EditorComponent ref={(r) => this._editor = r}
                         onChange={this.onChange.bind(this)}
                         value={this.getCurrentValue()}
                         options={schema}
                         microcastleStore={this.props.microcastleStore}
                         microcastleSchema={this.props.microcastleSchema}
                         dispatch={this.props.dispatch} />
     </ItemFrame>
    );
  }
}


export default SingleEditor;
