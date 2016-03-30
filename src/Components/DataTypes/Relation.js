import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash'

import DataTypes from '../DataTypes';

import EntryEditor from '../Editors/Entry';
import NewEditor from '../Editors/New';


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

    return (
      <div>
        <AppBar title={"Creating New " + relationName}
           iconElementLeft={
             <IconButton onClick={this.onReselect.bind(this)}>
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

  getEditingView() {
    return (
      <div>
        <AppBar title={this.props.value}
            iconElementLeft={
              <IconButton onClick={this.onReselect.bind(this)}>
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

  getChosenView() {
    return (
      <div>
        <AppBar title={this.props.value}
            iconElementLeft={
              <IconButton onClick={this.onReselect.bind(this)}>
                <NavigationClose />
              </IconButton>
            }
           iconElementRight={
             <IconButton onClick={this.setEditing.bind(this)}>
               <NavigationExpandMoreIcon />
             </IconButton>
           } />
      </div>
    );
  }

  getChoosingView() {
    const relationName = this.props.options.relative;
    const relation = this.props.microcastleStore.get('data').get(relationName);

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
    return <Paper zDepth={3} style={style.base}>
        {this.getView()}
    </Paper>;
  }
}

export default RelationEditor;
