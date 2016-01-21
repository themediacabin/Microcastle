import React from 'react';
import Immutable from 'immutable';

import DataTypes from '../DataTypes';

import EntryEditor from '../Editors/Entry';
import NewEditor from '../Editors/New';

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
    return false;
  }

  constructor(props) {
    super(props);
    this.state = {
      editorWrap: new Immutable.Map()
    };
    if (!!props.value) {
      onChoose(props.value);
    }
  }

  isChosen() {
    return !!this.props.value;
  }

  isCreating() {
    return !this.props.value && this.state.editorWrap.get('open', false);
  }

  getEditor() {
    if (this.state.editorWrap.get('action') == 'EDIT_ENTRY'){
      return <EntryEditor
           schema={this.getCurrentSchema()}
           microcastleStore={this.props.microcastleStore}
           microcastleSchema={this.props.microcatleSchema}
           microcastleEditor={this.state.editorWrap}
           changeTempState={this.onEditorChange.bind(this)}
           dispatch={this.props.dispatch}
           ref={c => this._editor = c}
        />
    }
    return <NewEditor
         schema={this.getCurrentSchema()}
         microcastleStore={this.props.microcastleStore}
         microcastleSchema={this.props.microcatleSchema}
         microcastleEditor={this.state.editorWrap}
         changeTempState={this.onEditorChange.bind(this)}
         dispatch={this.props.dispatch}
         ref={c => this._editor = c}
      />
  }

  getCurrentSchema() {
    const schema = this.props.options.relative;
    return this.props.microcastleSchema[schema];
  }

  onEditorChange(v) {
    this.setState({editorWrap: this.state.editorWrap.set('tempState', v)});
  }

  onChoose(chosen) {
    this.setState({editorWrap: this.state.editorWrap
      .set('open', true).set('schema', this.props.options.relative)
      .set('entry', chosen).set('action', 'EDIT_ENTRY')
      .set('tempState', this.props.microcastleStore.getIn([this.props.options.relative, chosen]))
    });

    this.props.onChange(chosen);
  }

  onCreate() {
    this.setState({editorWrap: this.state.editorWrap
      .set('open', true).set('schema', this.props.options.relative)
      .set('action', 'CREATE_NEW')
      .set('tempState', false)
    });

    this.props.onChange(false);
  }

  onToggleSelect() {
    this.setState(new Immutable.Map());
    this.props.onChange(false);
  }

  onSaveEdit() {
    this._editor.onSubmit();
  }

  onSaveNew() {
    this._editor.onSubmit().then((created) => {
      _.forEach(created, (val, key) => onChoose(created));
    });
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
    } else if (this.isCreating()) {
      return <div>
        <div>
          <FlatButton
            label="Choose Other"
            secondary={true}
            onClick={this.onToggleSelect.bind(this)} />
          <FlatButton
            label="Save And Use"
            secondary={true}
            onClick={this.onSaveNew.bind(this)} />
        </div>
        <div style={style.editor}>{this.getEditor()}</div>
      </div>
    }

    const selection = relation.map((value, name) => {
      return <li key={name}><a onClick={this.onChoose.bind(this, name)}>{name}</a></li>;
    }).toArray();

    return <div style={style.selector}>
      <a onClick={this.onCreate.bind(this)}>Create New</a>
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
