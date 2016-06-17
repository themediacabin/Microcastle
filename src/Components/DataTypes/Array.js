import React from 'react';
import { findDOMNode } from 'react-dom';
import Immutable from 'immutable';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import TimesIcon from 'react-icons/lib/md/clear';
import BarsIcon from 'react-icons/lib/md/reorder';

import DataTypes from '../DataTypes';

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
  }

};

const dragSource = {
  beginDrag: (props) => {
    setTimeout(_ => props.setDraggingIndex(props.index), 0);
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

class ArrayItem extends React.Component {
  onSave() {
    if (this._editor != null) {
      return this._editor.onSave();
    }
    return new Promise((resolve) => resolve());
  }

  render() {
    this._editor = null;
    const index = this.props.index;
    const size = this.props.size;
    const onMove = this.props.onMove;
    const onDelete = this.props.onDelete;

    return this.props.connectDragPreview(this.props.connectDropTarget(
      <div key={index} style={style.item(this.props.draggingIndex !== index)}>
        <div style={style.header}> 
          {this.props.connectDragSource(<div><BarsIcon style={style.dragIcon} /></div>)}
          <TimesIcon style={style.closeIcon} onClick={onDelete} />
        </div>
        <div style={style.content}>
          <this.props.SubType
                ref={(r) => {this._editor = r}}
                onChange={this.props.individualChange.bind(this, index)}
                value={this.props.individualValue}
                options={this.props.options}
                microcastleStore={this.props.microcastleStore}
                microcastleSchema={this.props.microcastleSchema}
                dispatch={this.props.dispatch} />
        </div>
      </div>
    ));
  }
}

const connectFn = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

const WrappedArrayItem = DropTarget('card', dragTarget, connect => ({connectDropTarget: connect.dropTarget()}))
  ((DragSource('card', dragSource, connectFn))
    (ArrayItem));

class ArrayEditor extends React.Component {
  constructor(props) {
    super();
    this.state = {
      draggingIndex: null,
    }
  }

  onSave() {
    return Promise.all(_.map(this._editors, (e) => e.onSave()))
  }

  setDraggingIndex(i) {
    this.setState({
      draggingIndex: i,
    });
  }


  static defaultValue() {
    return new Immutable.List([]);
  }

  onAdd() {

    let val = this.props.value;
    if (this.props.value == null || this.props.value === '') {
      val = Immutable.List();
    }

    this.props.onChange(val.insert(0,
      DataTypes.stringToComponent(this.props.options.subtype.type).defaultValue()
    ));
  }

  onDelete(index) {
    this.props.onChange(this.props.value.delete(index));
  }

  onMove(prevIndex, newIndex) {
    const value = this.props.value.get(prevIndex);
    const removed = this.props.value.delete(prevIndex);
    const inserted = removed.insert(newIndex, value);
    this.props.onChange(Immutable.fromJS(inserted));
  }

  individualChange(index, value) {
    this.props.onChange(this.props.value.set(index, value));
  }

  render() {
    this._items = [];
    const SubType = DataTypes.stringToComponent(this.props.options.subtype.type)

    let val = this.props.value;
    if (this.props.value == null || this.props.value === '') {
      val = Immutable.List();
    }

    const components = val.map((individualValue, index) => {
      return <WrappedArrayItem  ref={(r) => this._items.push(r)}
                                key={index}
                                index={index}
                                setDraggingIndex={this.setDraggingIndex.bind(this)}
                                draggingIndex={this.state.draggingIndex}
                                size={val.size}
                                onMove={this.onMove.bind(this)}
                                onDelete={this.onDelete.bind(this, index)}
                                individualChange={this.individualChange.bind(this)}
                                individualValue={individualValue}
                                SubType={SubType}
                                options={this.props.options.subtype}
                                microcastleStore={this.props.microcastleStore}
                                microcastleSchema={this.props.microcastleSchema}
                                dispatch={this.props.dispatch} 
                                parent={this}/>
    })

    return (
      <div style={style.base}>
        <button style={style.button} onClick={this.onAdd.bind(this)}>Add Item</button>
        <div>
          {components}
        </div>
      </div>
    );
  }
}

export default (ArrayEditor);
