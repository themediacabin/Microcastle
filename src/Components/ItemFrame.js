import React from 'react';

const style = {
  base: {
    display: 'flex',
    minHeight: 20,
  },
  titleBox: {
    background: 'white',
    width: 100,
    textAlign: 'right',
    flexGrow: 0,
    flexShink: 0,
  },
  title: {
    color: '#333',
    padding: 0,
    fontWeight: '200',
    fontSize: '0.8em',
    paddingRight: 10,
    marginTop: 10,
  },
  contentBox: {
    background: 'white',
    flex: '1 1 1px',
    padding: 10,
  },
}

class ItemFrame extends React.Component {
  render() {
    return <div style={style.base}>
      <div style={style.titleBox}>
        <h3 style={style.title}>{this.props.title}</h3>
      </div>
      <div style={style.contentBox}>
        {this.props.children}
      </div>
    </div>;
  }
}

export default ItemFrame;
