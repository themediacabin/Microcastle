import React from 'react';

class SelectEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  onSave() {
    return new Promise((resolve) => resolve());
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
        <option value=''>Choose One</option>
        {options}
      </select>
    );
  }
}

export default SelectEditor;
