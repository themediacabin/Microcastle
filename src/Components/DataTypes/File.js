import React from 'react';

import { connect } from 'react-redux';
import { getViewValue } from '../../Store/View';
import { changeView } from '../../Store/Store';

class FileEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  static validate() {
    return [];
  }

  onChange(event) {
    let self = this;
    let reader = new FileReader();
    reader.onload = function() {
        let dataURL = reader.result;
        self.props.dispatch(changeView(self.props.view, dataURL));
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

export default connect()(FileEditor);
