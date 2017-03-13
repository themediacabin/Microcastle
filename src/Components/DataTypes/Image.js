import React from 'react';

import { connect } from 'react-redux';
import { getViewValue } from '../../Store/View';
import { changeView } from '../../Store/Store';

const style = {
  image: {
    maxHeight: '300px', 
  }
};

class ImageEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  static validate() {
    return [];
  }

  onChange(event) {
    if (event.target.files.length == 0) return;
    if (event.target.files[0].type.match('image.*')) {
      let self = this;
      let reader = new FileReader();
      reader.onload = function() {
          let dataURL = reader.result;
          self.props.dispatch(changeView(self.props.view, {full: dataURL}));
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  render() {
    const image = this.props.value && this.props.value.full;
    return (
      <span>
        {image ? <img src={image} style={style.image} /> : null}
        <input type="file" onChange={this.onChange.bind(this)} />
      </span>
    );
  }
}

const connectComponent = connect((state, props) => {
  return {
    value: getViewValue(state.microcastle, props.view),
  };
});

export default connectComponent(ImageEditor);
