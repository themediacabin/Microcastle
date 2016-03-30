import React from 'react';
import Immutable from 'immutable';

import DataTypes from '../DataTypes';

const style = {
  base: {
  }
};

class ArrayEditor extends React.Component {
  static defaultValue() {
    return new Immutable.List([]);
  }

  onAdd() {
    this.props.onChange(this.props.value.push(
      DataTypes.stringToComponent(this.props.options.subtype).defaultValue()
    ));
  }

  onRemove() {
    this.props.onChange(this.props.value.slice(0, -1));
  }

  individualChange(index, value) {
    this.props.onChange(this.props.value.set(index, value));
  }

  render() {
    const SubType = DataTypes.stringToComponent(this.props.options.subtype)

    const components = this.props.value.map((individualValue, index) => {
      return <div key={index}>
        <SubType
              onChange={this.individualChange.bind(this, index)}
              value={individualValue}
              options={this.props.options.suboptions}
              microcastleStore={this.props.microcastleStore}
              microcastleSchema={this.props.microcastleSchema}
              dispatch={this.props.dispatch}
               />
      </div>
    })

    return (
      <div style={style.base}>
        <div>
          {components}
        </div>
        <div>
          <button
            label="-"
            secondary={true}
            onClick={this.onRemove.bind(this)} />
          <button
            label="+"
            primary={true}
            onClick={this.onAdd.bind(this)} />
        </div>
      </div>
    );
  }
}

export default ArrayEditor;
