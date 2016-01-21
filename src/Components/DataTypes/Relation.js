import React from 'react';
import Immutable from 'immutable';

import DataTypes from '../DataTypes';

import EntryEditor from '../Editors/Entry';

import FlatButton from 'material-ui/lib/flat-button';

const style = {
  base: {
  },
  selector: {
    height: '300px',
    overflowY: 'scroll',
    width: '100%',
  },
  editor: {
    height: '300px',
    overflowY: 'scroll',
    width: '100%',
  },
}

class RelationEditor extends React.Component {
  static defaultValue() {
    return new Immutable.List(null);
  }

  isChosen() {
    return !!this.props.value.get('editing', false);
  }

  getEditor() {
    return <EntryEditor
                   schema={this.getCurrentSchema()}
                   microcastleStore={this.props.microcastleStore}
                   microcastleSchema={this.props.microcatleSchema}
                   microcastleEditor={this.props.value}
                   changeTempState={this.onEditorChange.bind(this)}
                   dispatch={this.props.dispatch}
                   ref={c => this._editor = c}
      />
  }

  getCurrentSchema() {
    const schema = this.props.value.get('schema');
    return this.props.microcastleSchema[schema];
  }

  onEditorChange(v) {
    this.props.onChange(this.props.value.set('tempState', v));
  }

  onChoose(chosen) {
    this.props.onChange(Immutable.fromJS({
      editing: true,
      schema: this.props.options.relative,
      entry: chosen,
      tempState: this.props.microcastleStore.getIn([this.props.options.relative, chosen])
    }));
  }

  onToggleSelect() {
    this.props.onChange(new Immutable.List(null));
  }

  onSaveEdit() {
    this._editor.onSubmit();
  }

  getView() {
    const relationName = this.props.options.relative;
    const relation = this.props.microcastleStore.get(relationName);

    if (this.isChosen()) {
      return <div>
        <div>
          <FlatButton
            label="Choose Other"
            secondary={true}
            onClick={this.onToggleSelect.bind(this)} />
          <FlatButton
            label="Save Changes to Selected"
            secondary={true}
            onClick={this.onSaveEdit.bind(this)} />
        </div>
        <div style={style.editor}>{this.getEditor()}</div>
      </div>
    }

    const selection = relation.map((value, name) => {
      return <li key={name}><a onClick={this.onChoose.bind(this, name)}>{name}</a></li>;
    }).toArray();

    return <div style={style.selector}>
      <ul>{selection}</ul>
    </div>
  }

  render() {
    return <div style={style.base}>
        {this.getView()}
    </div>;
  }
}

export default RelationEditor;
