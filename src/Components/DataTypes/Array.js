import React from 'react';
import Immutable from 'immutable';

import DataTypes from '../DataTypes';

const style = {
  header: {
    background: '#F57F61',
    color: 'white',
    margin: 0,
    padding: 5,
  },
  item: {
    background: 'white',
    marginTop: 5,
    marginBottom: 5,
    boxShadow: 'rgb(43, 43, 43) 0px 0px 14px -6px',
  },
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

class ArrayEditor extends React.Component {
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

    const components = this.props.value.map((individualValue, index) => {
      return <div key={index} style={style.item}>
        <div style={style.header}>
          {index === 0 ? null : <button style={style.button} onClick={this.onMove.bind(this, index, index-1)}>Move Up</button>}
          {index === this.props.value.size-1 ? null : <button style={style.button} onClick={this.onMove.bind(this, index, index+1)}>Move Down</button>}
          <button style={style.button} onClick={this.onDelete.bind(this, index)}>Delete</button>
        </div>
        <div style={style.content}>
          <SubType
                onChange={this.individualChange.bind(this, index)}
                value={individualValue}
                options={this.props.options.suboptions}
                microcastleStore={this.props.microcastleStore}
                microcastleSchema={this.props.microcastleSchema}
                dispatch={this.props.dispatch} />
        </div>
      </div>
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

export default ArrayEditor;
