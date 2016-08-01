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
    const EditorComponent = DataTypes.stringToComponent(schema.type);

    return (
      <ItemFrame title={attributeName}>
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
