import React from 'react';
import { findDOMNode } from 'react-dom';
import Immutable from 'immutable';
import R from 'ramda';
import { DragSource, DropTarget } from 'react-dnd';
import { connect } from 'react-redux';

import TimesIcon from 'react-icons/lib/md/clear';
import BarsIcon from 'react-icons/lib/md/reorder';

import DataTypes from '../DataTypes';
import { getViewValue, getSchemaFromView } from '../../Store/View';
import { removeNested } from '../../Store/DiffTree';
import { changeView } from '../../Store/Store';

const style = {
  header: {
    flex: '0 0',
    color: 'gray',
    margin: 0,
    padding: 5,
  },
  item: (show) => ({
    opacity: show ? 1 : 0,
    background: 'white',
    marginTop: 5,
    marginBottom: 5,
    border: 'solid 1px rgb(204, 204, 204)',
    display: 'flex',
  }),
  content: {
    flex: '1 1',
    padding: 5,
  },
  dragIcon: {
    display: 'block',
    fontSize: '20px',
    marginRight: 5,
    marginBottom: 10,
    cursor: 'move',
    color: 'rgb(204, 204, 204)',
  },
  closeIcon: {
    display: 'block',
    fontSize: '20px',
    marginRight: 5,
    marginBottom: 5,
    cursor: 'pointer',
    color: 'rgb(204, 204, 204)',
  },
  button: {
    background: '#F57F61',
    color: 'white',
    fontSize: 13,
    borderRadius: 4,
    padding: '4px 8px',
    border: 'none',
    cursor: 'pointer',
    margin: 2,
  },
};

const dragSource = {
  beginDrag: (props) => {
    setTimeout(() => props.setDraggingIndex(props.index), 0);
    return {
      id: props.id,
      parent: props.parent,
      index: props.index
    };
  },
  endDrag: (props) => {
    props.setDraggingIndex(null);
  }
};

const dragTarget = {
  hover: (props, monitor, component) => {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
    if (props.parent !== monitor.getItem().parent) return;
    if (dragIndex === hoverIndex) return;
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const clientOffset = monitor.getClientOffset();
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
    props.onMove(dragIndex, hoverIndex);
    props.setDraggingIndex(hoverIndex);
    monitor.getItem().index = hoverIndex;
  }
};

const connectItemDrag = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
};

const WrapArrayItem = R.pipe(
  DragSource('card', dragSource, connectItemDrag),
  DropTarget('card', dragTarget, connect => ({connectDropTarget: connect.dropTarget()})),
);

const ArrayItem = (props) => {
  const schema = props.currentSchema;
  const Type = DataTypes.stringToComponent(schema.type);
  const index = props.index;
  const onDelete = props.onDelete;

  return props.connectDragPreview(props.connectDropTarget(
    <div key={index} style={style.item(props.draggingIndex !== index)}>
      <div style={style.header}> 
        {props.connectDragSource(<div><BarsIcon style={style.dragIcon} /></div>)}
        <TimesIcon className="microcastle-array-remove" style={style.closeIcon} onClick={onDelete} />
      </div>
      <div style={style.content}>
        <Type schema={props.schema}
              view={props.view} />
      </div>
    </div>
  ));
};

const WrappedArrayItem = WrapArrayItem(ArrayItem);

const NewItemButton = ({style, onClick, singularName}) => {
  return <button style={style} onClick={onClick}>Add {singularName || 'Item'}</button>;
};

class ArrayEditor extends React.Component {
  static defaultValue() {
    return Immutable.fromJS([]);
  }

  static validate(scheme, val) {
    if (scheme.required && (val.length == 0))
      return ['required'];
    return [];
  }

  static getChildren(schema, view, value) {
      return R.map(index =>
          view.update('part', (part = new Immutable.List()) => part.push(index))
      )(R.range(0, value.size));
  }

  constructor(props) {
    super(props);
    this.state = {
      draggingIndex: null,
    };
  }

  setDraggingIndex(i) {
    this.setState({
      draggingIndex: i,
    });
  }

  onAdd() {
    let val = this.props.value;
    if (this.props.value == null || this.props.value === '') {
      val = Immutable.List();
    }

    const schema = this.props.currentSchema;

    const newVal = val.insert(
      0, 
      DataTypes.stringToComponent(schema.subtype.type).defaultValue()
    );

    this.props.dispatch(changeView(this.props.view, newVal));
  }

  onDelete(index) {
    const newVal = this.props.value.delete(index);
    this.props.dispatch(changeView(this.props.view, newVal));
    removeNested(this.props.dispatch, this.props.schema, this.props.microcastleState, this.props.view);
  }

  onMove(prevIndex, newIndex) {
    const value = this.props.value.get(prevIndex);
    const removed = this.props.value.delete(prevIndex);
    const inserted = removed.insert(newIndex, value);
    this.props.dispatch(changeView(this.props.view, inserted));
  }

  render() {
    const schema = this.props.currentSchema;
    const singularName = schema.singularName || 'Item';

    let val = this.props.value;
    if (this.props.value == null || this.props.value === '') {
      val = Immutable.List();
    }

    const components = val.map((individualValue, index) => {
      return <WrappedArrayItem key={index}
                               index={index}
                               currentSchema={schema['subtype']}
                               setDraggingIndex={this.setDraggingIndex.bind(this)}
                               draggingIndex={this.state.draggingIndex}
                               size={val.size}
                               onMove={this.onMove.bind(this)}
                               onDelete={this.onDelete.bind(this, index)}
                               schema={this.props.schema}
                               parent={this}
                               view={this.props.view.update('part', (l = new Immutable.List()) => l.push(index))}
      />;
    });

    return (
      <div style={style.base}>
        <NewItemButton style={style.button} onClick={this.onAdd.bind(this)} singularName={singularName} />
        <div>
          {components}
        </div>
      </div>
    );
  }
}

const connectArrayEditor = connect((state, props) => {
  return {
    value: getViewValue(state.microcastle, props.view),
    microcastleState: state.microcastle,
    currentSchema: getSchemaFromView(props.schema, state.microcastle, props.view)
  };
});


export default connectArrayEditor(ArrayEditor);

export {
  ArrayEditor as ArrayEditor,
  ArrayItem as WrappedArrayItem,
  NewItemButton as NewItemButton,
};
