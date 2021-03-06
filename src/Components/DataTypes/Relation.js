import React from "react";
import I from "immutable";

import { connect } from "react-redux";

import EntryEditor from "../Editors/Entry";

import Store from "../../Store/Store";
import { changeView, removeNewState } from "../../Store/Store";
import {
  getViewValue,
  getSchemaFromView,
  getNewViewEntry,
  getAllAttributesForEntry,
  getAllEntries
} from "../../Store/View";

const style = {
  base: hideBorder => ({
    border: hideBorder ? "none" : "1px solid rgb(214, 214, 214)"
  }),
  error: { padding: 5, color: "red", fontWeight: 900, margin: 5 },
  header: { background: "white", padding: 5, fontWeight: "200", color: "#888" },
  selector: { padding: 5 },
  headerButton: {
    float: "right",
    background: "#888",
    border: 0,
    borderRadius: 2,
    margin: 1,
    color: "white",
    cursor: "pointer"
  },
  headerTitle: { display: "inline" },
  defaultOption: {
    marginBottom: 5,
    padding: 5,
    cursor: "pointer",
    background: "#EEE",
    color: "#333",
    paddingLeft: 10
  },
  nextButton: {
    float: "right",
    border: "none",
    background: "#999",
    color: "black"
  },
  prevButton: {
    float: "left",
    border: "none",
    background: "#999",
    color: "black"
  },
  deleteButton: {
    float: "right",
    background: "#881111",
    borderRadius: "50%",
    color: "white",
    width: 20,
    height: 20,
    textAlign: "center"
  }
};

const EDITING = "EDITING";
const CHOSEN = "CHOSEN";
const CHOOSING = "CHOOSING";

const getChildView = (schema, view, microcastle) => {
  const value = getViewValue(microcastle, view);
  const currentSchema = getSchemaFromView(schema, microcastle, view);
  // pretend microcastle dosent exist, a bad hack because its not neccisery
  if (typeof value == "string") {
    return I.fromJS({
      state: "change",
      type: currentSchema.relative,
      entry: value
    });
  }

  return value;
};

const getDisplayState = (value, editing = false) => {
  if (value && (editing || typeof value != "string")) return EDITING;
  if (value && typeof value == "string" && value != "") return CHOSEN;
  return CHOOSING;
};

class RelationEditor extends React.Component {
  static defaultValue() {
    return null;
  }

  static beforeSave(microcastleState, view) {
    const val = getViewValue(microcastleState, view);
    if (!I.Map.isMap(val)) return val;

    const newState = getNewViewEntry(microcastleState, val);
    return newState.get("entryID");
  }

  static validate() {
    return [];
  }

  static onRemoved(dispatch, microcastleState, view) {
    const value = getViewValue(microcastleState, view);
    if (I.Map.isMap(value)) {
      dispatch(removeNewState(value.get("entry")));
    }
  }

  static getChildren(schema, view, microcastle) {
    const value = getViewValue(microcastle, view);
    if (getDisplayState(value) == CHOOSING) return [];
    const childView = getChildView(schema, view, microcastle);
    return getAllAttributesForEntry(schema, microcastle, childView);
  }

  constructor(props) {
    super(props);
    this.state = { page: 0, editing: false };
  }

  onChoose(chosen) {
    this.props.dispatch(changeView(this.props.view, chosen));
  }

  onDelete(val, info) {
    const schema = this.props.currentSchema;
    this.props.dispatch(Store.actions.deleteEntry(schema.relative, info.id));
  }

  setEditing() {
    this.setState({ editing: true });
  }

  onCreate() {
    const newID = Math.random();
    const schema = this.props.currentSchema;
    const newValue = I.fromJS({
      state: "new",
      type: schema.relative,
      entry: newID
    });

    this.props.dispatch(Store.actions.addNewState(newID, schema.relative));
    this.props.dispatch(changeView(this.props.view, newValue));
  }

  onReselect() {
    if (I.Map.isMap(this.props.value)) {
      this.props.dispatch(removeNewState(this.props.value.get("entry")));
    }
    this.props.dispatch(changeView(this.props.view, null));
  }

  getEditingView() {
    const childView = getChildView(
      this.props.schema,
      this.props.view,
      this.props.microcastle
    );
    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{childView.get("entry")}</h4>
          {
            this.props.currentSchema.cantReselect
              ? null
              : <button
                style={style.headerButton}
                className="microcastle-relation-reselect"
                onClick={this.onReselect.bind(this)}
              >
                Reselect
              </button>
          }
        </div>
        <div style={style.editor}>
          <EntryEditor schema={this.props.schema} view={childView} />
        </div>
      </div>
    );
  }

  getChosenView() {
    const childView = getChildView(
      this.props.schema,
      this.props.view,
      this.props.microcastle
    );
    const childVal = getViewValue(this.props.microcastle, childView);
    const relationName = this.props.currentSchema.relative;
    const childSchema = getSchemaFromView(
      this.props.schema,
      this.props.microcastle,
      I.fromJS({ type: relationName })
    );
    const view = childSchema.display == null ? null : <childSchema.display
        onClick={() => {
        }}
        name={childView.get("entry")}
        value={childVal}
      />;

    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{childView.get("entry")}</h4>
          {
            this.props.currentSchema.cantReselect
              ? null
              : <button
                style={style.headerButton}
                className="microcastle-relation-reselect"
                onClick={this.onReselect.bind(this)}
              >
                Reselect
              </button>
          }
          {
            this.props.currentSchema.cantEdit
              ? null
              : <button
                style={style.headerButton}
                onClick={this.setEditing.bind(this)}
              >
                Edit
              </button>
          }
        </div>
        {
          view ? <div style={style.selector}>
              <div>
                {view}
              </div>
            </div> : null
        }
      </div>
    );
  }

  setPage(i) {
    this.setState({ page: i });
  }

  getChoosingView() {
    const currentSchema = this.props.currentSchema;
    const relationName = currentSchema.relative;
    const relation = getAllEntries(this.props.microcastle, relationName);
    const relativeSchema = getSchemaFromView(
      this.props.schema,
      this.props.microcastle,
      I.fromJS({ type: relationName })
    );

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

      if (relativeSchema.display == null) {
        return (
          <div
            key={name}
            className="microcastle-relation-option"
            style={style.defaultOption}
          >
            <span onClick={this.onChoose.bind(this, name)}>{name}</span>
            {
              relativeSchema.onDelete == null
                ? null
                : <span
                  style={style.deleteButton}
                  className="microcastle-relation-delete"
                  onClick={this.onDelete.bind(this, value, { id: name })}
                >
                  x
                </span>
            }
          </div>
        );
      } else {
        return (
          <relativeSchema.display
            key={name}
            onChoose={this.onChoose.bind(this, name)}
            onDelete={this.onDelete.bind(this, value, { id: name })}
            name={name}
            value={value}
          />
        );
      }
    }).toArray();

    return (
      <div>
        <div style={style.header}>
          <h4 style={style.headerTitle}>{"Choose One " + relationName}</h4>
          {
            currentSchema.cantCreate
              ? null
              : <button
                style={style.headerButton}
                className="microcastle-relation-create"
                onClick={this.onCreate.bind(this)}
              >
                Create New
              </button>
          }
        </div>
        <div style={style.selector}>
          <div>
            {selection}
          </div>
          {
            this.state.page > 0
              ? <button
                style={style.prevButton}
                onClick={this.setPage.bind(this, this.state.page - 1)}
              >
                Prev
              </button>
              : null
          }
          {
            relation.size / pageSize > this.state.page + 1
              ? <button
                style={style.nextButton}
                onClick={this.setPage.bind(this, this.state.page + 1)}
              >
                Next
              </button>
              : null
          }
          <div style={{ clear: "both" }} />
        </div>
      </div>
    );
  }

  getView() {
    switch (getDisplayState(this.props.value, this.state.editing)) {
      case EDITING:
        return this.getEditingView();
      case CHOSEN:
        return this.getChosenView();
    }
    return this.getChoosingView();
  }

  render() {
    return (
      <div style={style.base(this.props.currentSchema.hideBorder)}>
        {this.getView()}
      </div>
    );
  }
}

const connectComponent = connect((state, props) => {
  return {
    value: getViewValue(state.microcastle, props.view),
    microcastle: state.microcastle,
    currentSchema: getSchemaFromView(
      props.schema,
      state.microcastle,
      props.view
    )
  };
});

export default connectComponent(RelationEditor);

