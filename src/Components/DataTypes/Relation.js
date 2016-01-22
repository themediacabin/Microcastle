import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash'

import DataTypes from '../DataTypes';

import EntryEditor from '../Editors/Entry';
import NewEditor from '../Editors/New';

import FlatButton from 'material-ui/lib/flat-button';
import Paper from 'material-ui/lib/paper';
import AppBar from 'material-ui/lib/app-bar';
import NavigationClose from 'material-ui/lib/svg-icons/navigation/close';
import IconButton from 'material-ui/lib/icon-button';
import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';


const style = {
  base: {
    marginTop: '10px',
    marginBottom: '10px',
  },
  gridItem: {
    cursor: 'pointer',
  },
  selector: {
    height: '300px',
    overflowY: 'scroll',
    overflowX: 'hidden',
    width: '100%',
  },
  editor: {
    height: '300px',
    overflowY: 'scroll',
    width: '100%',
    padding: '5px',
  },
}


function getFirstImageAttributeName(schema) {
  return _.findKey(schema.attributes, attr => attr.type == 'image');
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
    this.setState({editorWrap: new Immutable.Map()});
    this.props.onChange(false);
  }

  onSaveEdit() {
    this._editor.onSubmit();
  }

  onSaveNew() {
    this._editor.onSubmit().then((created) => {
      _.forEach(created, (val, key) => this.onChoose(key));
    });
  }

  getNewEditor() {
    const relationName = this.props.options.relative;

    return (
      <div>
        <AppBar title={"Creating New " + relationName}
           iconElementLeft={
             <IconButton onClick={this.onToggleSelect.bind(this)}>
               <NavigationClose />
             </IconButton>
           }
           iconElementRight={
             <FlatButton label="Save And Use"
                         onClick={this.onSaveNew.bind(this)} />
           } />
        <div style={style.editor}>
          <NewEditor schema={this.getCurrentSchema()}
                     microcastleStore={this.props.microcastleStore}
                     microcastleSchema={this.props.microcatleSchema}
                     microcastleEditor={this.state.editorWrap}
                     changeTempState={this.onEditorChange.bind(this)}
                     dispatch={this.props.dispatch}
                     ref={c => this._editor = c} />
        </div>
      </div>
    );
  }

  getEntryEditor() {
    return (
      <div>
        <AppBar title={this.props.value}
            iconElementLeft={
              <IconButton onClick={this.onToggleSelect.bind(this)}>
                <NavigationClose />
              </IconButton>
            }
           iconElementRight={
             <FlatButton label="Save Changes"
                         onClick={this.onSaveEdit.bind(this)} />
           } />
        <div style={style.editor}>
          <EntryEditor schema={this.getCurrentSchema()}
                       microcastleStore={this.props.microcastleStore}
                       microcastleSchema={this.props.microcatleSchema}
                       microcastleEditor={this.state.editorWrap}
                       changeTempState={this.onEditorChange.bind(this)}
                       dispatch={this.props.dispatch}
                       ref={c => this._editor = c} />
        </div>
      </div>
    );
  }

  getSelect() {
    const relationName = this.props.options.relative;
    const relation = this.props.microcastleStore.get(relationName);

    const selection = relation.map((value, name) => {
      const image = getFirstImageAttributeName(this.getCurrentSchema());
      return (
        <GridTile key={name}
                  style={style.gridItem}
                  title={name}
                  onClick={this.onChoose.bind(this, name)}>
          {image ? <img src={value.get(image)} /> : <span />}
        </GridTile>
      );
    }).toArray();

    return (
      <div>
        <AppBar title={"Choose One " + relationName}
                showMenuIconButton={false} zDepth={0}
                iconElementRight={
                  <FlatButton label="Create New"
                              onClick={this.onCreate.bind(this)} />
                } />
        <div style={style.selector}>
          <GridList cols={3} cellHeight={200} padding={1}>
            {selection}
          </GridList>
        </div>
      </div>
    );
  }

  getView() {
    if (this.isChosen())
      return this.getEntryEditor();
    if (this.isCreating())
      return this.getNewEditor();
    return this.getSelect();
  }

  render() {
    return <Paper zDepth={3} style={style.base}>
        {this.getView()}
    </Paper>;
  }
}

export default RelationEditor;
