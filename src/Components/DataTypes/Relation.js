import React from 'react';
import I from 'immutable';

import { connect } from 'react-redux';

import EntryEditor from '../Editors/Entry';

import Store from '../../Store/Store';
import {changeView} from '../../Store/Store';
import {getViewValue, getSchemaFromView, getNewViewEntry} from '../../Store/View';

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
  },
  nextButton: {
    float: 'right',
    border: 'none',
    background: '#999',
    color: 'black',
  },
  prevButton: {
    float: 'left',
    border: 'none',
    background: '#999',
    color: 'black',
  },
  deleteButton: {
    float: 'right',
    background: '#881111',
    borderRadius: '50%',
    color: 'white',
    width: 20,
    height: 20,
    textAlign: 'center',
  },
};

const EDITING  = 'EDITING';
const CHOSEN   = 'CHOSEN';
const CHOOSING = 'CHOOSING';

class RelationEditor extends React.Component {
  static defaultValue() {
    return null;
  }

  static beforeSave(microcastleState, view) {
    const val = getViewValue(microcastleState, view);
    if (!I.Map.isMap(val)) return val;

    const newState = getNewViewEntry(microcastleState, val);
    return newState.get('entryID');
  }

  static validate() {
    return [];
  }

  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      editing: false,
    };
  }

  getDisplayState() {
    if (!!this.props.value && (this.state.editing || typeof this.props.value != 'string'))
      return EDITING;
    if (!!this.props.value && typeof this.props.value == 'string' && this.props.value != "")
      return CHOSEN;
    return CHOOSING;
  }

  onChoose(chosen) {
    this.props.dispatch(changeView(this.props.view, chosen));
  }

  //onDelete(val, info) {
  //  return this.getCurrentSchema().onDelete(val, info).then(
  //    () => {
  //      this.props.dispatch(
  //        Store.actions.deleteEntry(this.props.options.relative, info.id)
  //      );
  //    }
  //  );
  //}

  setEditing() {
    this.setState({editing: true});
  }

  onCreate() {
    const newID = Math.random();
    const schema = getSchemaFromView(this.props.schema, this.props.view);
    const newValue = I.fromJS({
      state: 'new',
      type: schema.relative,
      entry: newID,
    });

    this.props.dispatch(Store.actions.addNewState(newID, schema.relative));
    this.props.dispatch(changeView(this.props.view, newValue));
  }

  onReselect() {
    this.props.dispatch(changeView(this.props.view, null));
  }

  getChildView() {
    const schema = getSchemaFromView(this.props.schema, this.props.view);
    if (typeof this.props.value == 'string') {
      return I.fromJS({
        state: 'change',
        type: schema.relative,
        entry: this.props.value,
      });
    } 
    return this.props.value;  
  }

  getEditingView() {
    const childView = this.getChildView();
    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{childView.get('entry')}</h4>
          <button style={style.headerButton} className="microcastle-relation-reselect" onClick={this.onReselect.bind(this)}>Reselect</button>
        </div>

        <div style={style.editor}>
          <EntryEditor schema={this.props.schema}
                       view={childView} />
        </div>
      </div>
    );
  }

  getChosenView() {
    const childView = this.getChildView();
    const childVal = getViewValue(this.props.microcastle, childView);
    const currentSchema = getSchemaFromView(this.props.schema, this.props.view);
    const view = currentSchema.display == null ? null
                                               : <currentSchema.display onClick={() => {}} name={childView.get('entry')} value={childVal} />;
    
    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{childView.get('entry')}</h4>
          <button style={style.headerButton} className="microcastle-relation-reselect" onClick={this.onReselect.bind(this)}>Reselect</button>
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

  setPage(i) {
    this.setState({page: i});
  }

  getChoosingView() {
    const currentSchema = getSchemaFromView(this.props.schema, this.props.view);
    const relationName = currentSchema.relative;
    const relation = this.props.microcastle.get('data').get(relationName);

    const pageSize = 15;

    let i = 0;
    const selection = relation.map((value, name) => {
      if (i >= pageSize * this.state.page + pageSize) {
        i++;
        return null;
      }
      if (i < pageSize * this.state.page) {
        i++;
        return null;
      }
      i++;

      if (currentSchema.display == null) {
        return  <div key={name} style={style.defaultOption}>
          <span onClick={this.onChoose.bind(this, name)}>{name}</span>
          {currentSchema.onDelete == null ? null : <span style={style.deleteButton} onClick={()=>{}}>x</span>}
        </div>;
      } else {
        return <currentSchema.display key={name} onChoose={this.onChoose.bind(this, name)} onDelete={()=>{}} name={name} value={value} />;
      }
    }).toArray();

    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{"Choose One " + relationName}</h4>
          <button style={style.headerButton} className="microcastle-relation-create" onClick={this.onCreate.bind(this)}>Create New</button>
        </div>
        <div style={style.selector}>
          <div>
            {selection}
          </div>
          {this.state.page > 0 ? <button style={style.prevButton} onClick={this.setPage.bind(this, this.state.page-1)}>Prev</button> : null}
          {relation.size / pageSize > this.state.page + 1 ? <button style={style.nextButton} onClick={this.setPage.bind(this, this.state.page+1)}>Next</button> : null}
          <div style={{clear: 'both'}} />
        </div>
      </div>
    );
  }

  getView() {
    switch (this.getDisplayState()) {
      case EDITING:
        return this.getEditingView();
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

const connectComponent = connect((state, props) => {
  return {
    value: getViewValue(state.microcastle, props.view),
    microcastle: state.microcastle,
  };
});

export default connectComponent(RelationEditor);
