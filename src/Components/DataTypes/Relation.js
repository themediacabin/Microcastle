import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash'

import DataTypes from '../DataTypes';

import EntryEditor from '../Editors/Entry';
import NewEditor from '../Editors/New';


const style = {
  base: {
    boxShadow: 'rgb(43, 43, 43) 0px 0px 14px -6px',
  },
  header: {
    background: '#F57F61',
    color: 'white',
    padding: 5,
  },
  selector: {
    padding: 5,
  },
  headerButton: {
    float: 'right',
    background: 'white',
    border: 0,
    borderRadius: 'none',
    margin: 1,
    color: '#F57F61',
  },
  headerTitle: {
    display: 'inline',
  },
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
    };
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
    this.props.onChange(chosen);
  }

  setEditing() {
    this.setState({editorWrap: this.state.editorWrap
      .set('open', true).set('schema', this.props.options.relative)
      .set('entry', this.props.value).set('action', 'EDIT_ENTRY')
      .set('tempState', this.props.microcastleStore.get('data').getIn([this.props.options.relative, this.props.value]))
    });
  }

  onCreate() {
    this.setState({editorWrap: this.state.editorWrap
      .set('open', true).set('schema', this.props.options.relative)
      .set('action', 'CREATE_NEW')
      .set('tempState', false)
    });

    this.props.onChange(false);
  }

  onReselect() {
    this.setState({editorWrap: new Immutable.Map()});
    this.props.onChange(false);
  }

  onSaveEdit() {
    this._editor.onSubmit();
    this.setState({editorWrap: new Immutable.Map()});
  }

  onSaveNew() {
    this._editor.onSubmit().then((created) => {
      _.forEach(created, (val, key) => this.onChoose(key));
      this.setState({editorWrap: new Immutable.Map()});
    });
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
                     microcastleSchema={this.props.microcatleSchema}
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
                       microcastleSchema={this.props.microcatleSchema}
                       microcastleEditor={this.state.editorWrap}
                       changeTempState={this.onEditorChange.bind(this)}
                       dispatch={this.props.dispatch}
                       ref={c => this._editor = c} />
        </div>
      </div>
    );
  }

  getChosenView() {
    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{this.props.value}</h4>
          <button style={style.headerButton} onClick={this.onReselect.bind(this)}>Reselect</button>
          <button style={style.headerButton} onClick={this.setEditing.bind(this)}>Edit</button>
        </div>
      </div>
    );
  }

  getChoosingView() {
    const relationName = this.props.options.relative;
    const relation = this.props.microcastleStore.get('data').get(relationName);

    const selection = relation.map((value, name) => {
      const image = getFirstImageAttributeName(this.getCurrentSchema());
      return  <div key={name} onClick={this.onChoose.bind(this, name)}>
        {name}
        {image ? <img src={value.get(image)} /> : null}
      </div>
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
        {this.getView()}
    </div>;
  }
}

export default RelationEditor;
