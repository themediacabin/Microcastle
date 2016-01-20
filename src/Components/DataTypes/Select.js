import React from 'react';

import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

class SelectEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  onChange(event) {
    this.props.onChange(event.target.value);
  }

  render() {
    let options = [<span />];
    if (this.props.options){
      options = this.props.options.choices.map((name, i) => {
        return <option key={i} value={name}>{name}</option>
      });
    }

    return (
      <select value={this.props.value} onChange={this.onChange.bind(this)}>
        {options}
      </select>
    );
  }
}

export default SelectEditor;
