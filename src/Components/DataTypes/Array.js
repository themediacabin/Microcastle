import React from 'react';
import { findDOMNode } from 'react-dom';
import Immutable from 'immutable';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import DataTypes from '../DataTypes';

const style = {
  header: {
    background: '#F57F61',
    color: 'white',
    margin: 0,
    padding: 5,
  },
  item: (show) => ({
    opacity: show ? 1 : 0,
    background: 'white',
    marginTop: 5,
    marginBottom: 5,
    boxShadow: 'rgb(43, 43, 43) 0px 0px 14px -6px',
  }),
  content: {
    padding: 5,
  },
  button: {
    margin: 3,
    background: 'white',
    color: '#F57F61',
    borderRadius: 0,
    border: 'none',
  }

};

const dragSource = {
  beginDrag: (props) => {
    setTimeout(_ => props.setDraggingIndex(props.index), 0);
    return {
      id: props.id,
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
  render() {
    const index = this.props.index;
    const size = this.props.size;
    const onMove = this.props.onMove;
    const onDelete = this.props.onDelete;

    return this.props.connectDragSource(this.props.connectDropTarget(
      <div key={index} style={style.item(this.props.draggingIndex !== index)}>
        <div style={style.header}>
          <button style={style.button} onClick={onDelete}>Delete</button>
        </div>
        <div style={style.content}>
          <this.props.SubType
                onChange={this.props.individualChange.bind(this, index)}
                value={this.props.individualValue}
                options={this.props.options.suboptions}
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
    isDragging: monitor.isDragging(),
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

  setDraggingIndex(i) {
    this.setState({
      draggingIndex: i,
    });
  }


  static defaultValue() {
    return new Immutable.List([]);
  }

  onAdd() {
    this.props.onChange(this.props.value.insert(0,
      DataTypes.stringToComponent(this.props.options.subtype).defaultValue()
    ));
  }

  onDelete(index) {
    this.props.onChange(this.props.value.delete(index));
  }

  onMove(prevIndex, newIndex) {
    const value = this.props.value.get(prevIndex);
    const removed = this.props.value.delete(prevIndex);
    const inserted = removed.insert(newIndex, value);
    this.props.onChange(inserted);
  }

  individualChange(index, value) {
    this.props.onChange(this.props.value.set(index, value));
  }

  render() {
    const SubType = DataTypes.stringToComponent(this.props.options.subtype)

    const sortedComponents = this.props.value.sort();

    const components = this.props.value.map((individualValue, index) => {
      return <WrappedArrayItem  key={index}
                                index={index}
                                setDraggingIndex={this.setDraggingIndex.bind(this)}
                                draggingIndex={this.state.draggingIndex}
                                size={this.props.value.size}
                                onMove={this.onMove.bind(this)}
                                onDelete={this.onDelete.bind(this, index)}
                                individualChange={this.individualChange.bind(this)}
                                individualValue={individualValue}
                                SubType={SubType}
                                options={this.props.options}
                                microcastleStore={this.props.microcastleStore}
                                microcastleSchema={this.props.microcastleSchema}
                                dispatch={this.props.dispatch} />
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
