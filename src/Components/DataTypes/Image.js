import React from 'react';

const style = {
  image: {
    maxHeight: '300px', 
  }
};

class ImageEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  onSave() {
    return new Promise((resolve) => resolve());
  }

  onChange(event) {
    if (event.target.files[0].type.match('image.*')) {
      let self = this;
      let reader = new FileReader();
      reader.onload = function(e) {
          let dataURL = reader.result;
          self.props.onChange({full: dataURL});
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  render() {
    return (
      <span>
        <img src={this.props.value.full} style={style.image}  />
        <input type="file" onChange={this.onChange.bind(this)} />
      </span>
    );
  }
}

export default ImageEditor;
