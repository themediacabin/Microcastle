import React from 'react';
import Immutable from 'immutable';

import FlatButton from 'material-ui/lib/flat-button';

class ImageEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  onChange(event) {
    if (event.target.files[0].type.match('image.*')) {
      let self = this;
      let reader = new FileReader();
      reader.onload = function(e) {
          let dataURL = reader.result;
          self.props.onChange(dataURL);
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  render() {
    return (
      <span>
      <img src={this.props.value} />
      <input type="file" onChange={this.onChange.bind(this)} />
      </span>
    );
  }
}

export default ImageEditor;
