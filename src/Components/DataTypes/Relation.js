import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash'

import DataTypes from '../DataTypes';

import EntryEditor from '../Editors/Entry';
import NewEditor from '../Editors/New';


const style = {
  base: {
    border: '1px solid rgb(214, 214, 214)',
  },
  error: {
    padding: 5,
    color: 'red',
    fontWeight: 900,
    margin: 5
  },
  header: {
    background: 'white',
    padding: 5,
    fontWeight: '200',
    color: '#888',
  },
  selector: {
    padding: 5,
  },
  headerButton: {
    float: 'right',
    background: '#888',
    border: 0,
    borderRadius: 2,
    margin: 1,
    color: 'white',
    cursor: 'pointer',
  },
  headerTitle: {
    display: 'inline',
  },
  defaultOption: {
    marginBottom: 5,
    padding: 5,
    cursor: 'pointer',
    background: '#EEE',
    color: '#333',
    paddingLeft: 10,
  }
}


function getFirstImageAttributeName(schema) {
  return _.findKey(schema.attributes, attr => attr.type == 'image');
}

const EDITING = 'EDITING';
const CHOSEN = 'CHOSEN';
const CREATING = 'CREATING';
const CHOOSING = 'CHOOSING';

class RelationEditor extends React.Component {
  static defaultValue() {
    return false;
  }

  constructor(props) {
    super(props);
    this.state = {
      editorWrap: new Immutable.Map(),
      error: false,
    };
  }

  onSave() {
    if (this.getDisplayState() == EDITING) {
      this.setState({error: true});
      return new Promise((res, rej) => {res({error: 'Not Saved'})});
    } else if (this.getDisplayState() == CREATING) {
      this.setState({error: true});
      return new Promise((res, rej) => {res({error: 'Not Saved'})});
    }
    return new Promise((res, rej) => {res()});
  }

  getDisplayState() {
    if (!!this.props.value && this.state.editorWrap.get('open', false))
      return EDITING;
    if (!this.props.value && this.state.editorWrap.get('open', false))
      return CREATING;
    if (!!this.props.value && !this.state.editorWrap.get('open', false))
      return CHOSEN;
    return CHOOSING;
  }

  getCurrentSchema() {
    const schema = this.props.options.relative;
    return this.props.microcastleSchema[schema];
  }

  onEditorChange(v) {
    this.setState({editorWrap: this.state.editorWrap.set('tempState', v)});
  }

  onChoose(chosen) {
    this.setState({error: false});

    this.props.onChange(chosen);
  }

  setEditing() {
    this.setState({error: false});

    this.setState({editorWrap: this.state.editorWrap
      .set('open', true).set('schema', this.props.options.relative)
      .set('entry', this.props.value).set('action', 'EDIT_ENTRY')
      .set('tempState', this.props.microcastleStore.get('data').getIn([this.props.options.relative, this.props.value]))
    });
  }

  onCreate() {
    this.setState({error: false});

    this.setState({editorWrap: this.state.editorWrap
      .set('open', true).set('schema', this.props.options.relative)
      .set('action', 'CREATE_NEW')
      .set('tempState', false)
    });

    this.props.onChange(null);
  }

  onReselect() {
    this.setState({error: false});

    this.setState({editorWrap: new Immutable.Map()});
    this.props.onChange(null);
  }

  onSaveEdit(mounted = true) {
    this.setState({error: false});
    return new Promise((resolve, reject) => {
      this._editor.onSubmit().then((created) => {
        if (mounted) this.setState({editorWrap: new Immutable.Map()});
        resolve();
      }).catch((e) => reject(e));
    });
  }

  onSaveNew(mounted = true) {
    return this._editor.onSubmit()
      .then((created) => new Promise((resolve) => {
        _.forEach(created, (val, key) => this.onChoose(key));
        if (mounted) this.setState({editorWrap: new Immutable.Map()});
        resolve();
      })).catch((e) => reject(e));
  }

  getCreatingView() {
    const relationName = this.props.options.relative;
    const wrappedStore = this.props.microcastleStore.set('editor', this.state.editorWrap);

    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{"Creating New " + relationName}</h4>
          <button style={style.headerButton} onClick={this.onReselect.bind(this)}>Close</button>
          <button style={style.headerButton} onClick={this.onSaveNew.bind(this)}>Save</button>
        </div>
        <div style={style.editor}>
          <NewEditor schema={this.getCurrentSchema()}
                     microcastleStore={wrappedStore}
                     microcastleSchema={this.props.microcastleSchema}
                     microcastleEditor={this.state.editorWrap}
                     changeTempState={this.onEditorChange.bind(this)}
                     dispatch={this.props.dispatch}
                     ref={c => this._editor = c} />
        </div>
      </div>
    );
  }

  getEditingView() {
    const wrappedStore = this.props.microcastleStore.set('editor', this.state.editorWrap);
    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{this.props.value}</h4>
          <button style={style.headerButton} onClick={this.onReselect.bind(this)}>Reselect</button>
          <button style={style.headerButton} onClick={this.onSaveEdit.bind(this)}>Save</button>
        </div>

        <div style={style.editor}>
          <EntryEditor schema={this.getCurrentSchema()}
                       microcastleStore={wrappedStore}
                       microcastleSchema={this.props.microcastleSchema}
                       microcastleEditor={this.state.editorWrap}
                       changeTempState={this.onEditorChange.bind(this)}
                       dispatch={this.props.dispatch}
                       ref={c => this._editor = c} />
        </div>
      </div>
    );
  }

  getChosenView() {
    const relationName = this.props.options.relative;
    const currentSchema = this.getCurrentSchema();
    const value = this.props.microcastleStore.get('data').get(relationName).get(this.props.value);

    const view = currentSchema.display == null ? null
                                               : <currentSchema.display onClick={() => {}} name={this.props.value} value={value} />;
    
    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{this.props.value}</h4>
          <button style={style.headerButton} onClick={this.onReselect.bind(this)}>Reselect</button>
          <button style={style.headerButton} onClick={this.setEditing.bind(this)}>Edit</button>
        </div>
        <div style={style.selector}>
          <div>
            {view}
          </div>
        </div>
      </div>
    );
  }

  getChoosingView() {
    const relationName = this.props.options.relative;
    const relation = this.props.microcastleStore.get('data').get(relationName);

    const selection = relation.map((value, name) => {
      const currentSchema = this.getCurrentSchema()
      const image = getFirstImageAttributeName(this.getCurrentSchema());
      if (currentSchema.display == null) {
        return  <div key={name} style={style.defaultOption} onClick={this.onChoose.bind(this, name)}>
          {name}
        </div>
      } else {
        const currentSchema = this.getCurrentSchema()
        return <currentSchema.display key={name} onClick={this.onChoose.bind(this, name)} name={name} value={value} />
      }
    }).toArray();

    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{"Choose One " + relationName}</h4>
          <button style={style.headerButton} onClick={this.onCreate.bind(this)}>Create New</button>
        </div>
        <div style={style.selector}>
          <div>
            {selection}
          </div>
        </div>
      </div>
    );
  }

  getView() {
    switch (this.getDisplayState()) {
      case EDITING:
        return this.getEditingView();
      case CREATING:
        return this.getCreatingView();
      case CHOSEN:
        return this.getChosenView();
    }
    return this.getChoosingView();
  }

  render() {
    return <div style={style.base}>
        {this.state.error ? <div style={style.error}>This Needs To Be Saved</div> : false}
        {this.getView()}
    </div>;
  }
}

export default RelationEditor;
