import React from 'react';

class FileEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  onSave() {
    return new Promise((resolve) => resolve());
  }

  onChange(event) {
    let self = this;
    let reader = new FileReader();
    reader.onload = function() {
        let dataURL = reader.result;
        self.props.onChange(dataURL);
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  render() {
    return (
      <span>
        <input type="file" onChange={this.onChange.bind(this)} />
      </span>
    );
  }
}

export default FileEditor;
