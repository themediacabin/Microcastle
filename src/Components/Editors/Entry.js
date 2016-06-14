import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import _ from 'lodash';

import Store from '../../Store/Store';
import EditorFrame from '../EditorFrame';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';

const style = {
  base: {
    background: 'white',
    flexDirection: 'column',
  }
}

class EntryEditor extends React.Component {
  onSubmit() {
    let self = this;
    return Promise.all(_.map(this._columns, (e) => e == null ? true : e.onSave()))
    .then(() => {
      const entryID = self.props.microcastleStore.get('editor').get('entry');
      const schema = this.props.schema;
      if (!!schema.onEdit){
          schema.onEdit(this.getTempState().toJS(), {id: entryID})
            .then((edited) => {
              _.forIn(edited, (value, attributeName) => {
                const action = Store.actions.updateData(
                  self.props.microcastleStore.get('editor').get('schema'),
                  entryID,
                  attributeName,
                  Immutable.fromJS(value)
                );
                return self.props.dispatch(action);
              });
              if (this.props.closeEditor != undefined) this.props.closeEditor();
            });
      }
    }).catch((e) => console.log('Not Saved', e));
  }


  getTempState() {
    return this.props.microcastleStore.get('editor').get('tempState') || Immutable.Map({});
  }

  onComponentChange(attributeName, value) {
    const editorTempState = this.getTempState();
    const newEditorTempState = editorTempState.set(attributeName, value);
    this.props.changeTempState(newEditorTempState);
  }

  getCurrentValue(attributeName, defaultValue) {
    return this.props.microcastleStore.get('editor').getIn(['tempState', attributeName], defaultValue);
  }

  render() {
    const schema = this.props.schema.attributes;
    this._columns = [];

    const editorComponents = _.values(_.mapValues(schema, (columnOptions, columnName) => {
      const ColumnComponent = DataTypes.stringToComponent(columnOptions.type);
      return (
        <ItemFrame title={columnName} key={columnName}>
          <ColumnComponent ref={(r) => this._columns.push(r)}
                           onChange={this.onComponentChange.bind(this, columnName)}
                           value={this.getCurrentValue(columnName, ColumnComponent.defaultValue())}
                           options={columnOptions}
                           microcastleStore={this.props.microcastleStore}
                           microcastleSchema={this.props.microcastleSchema}
                           dispatch={this.props.dispatch} />
        </ItemFrame>
      );
    }));

    return (<div style={style.base}>
        {editorComponents}</div>
    );
  }
}

export default EntryEditor;
