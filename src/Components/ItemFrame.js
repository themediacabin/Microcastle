import React from 'react';

const style = {
  base: {
    display: 'flex',
    minHeight: 20,
  },
  titleBox: {
    background: 'rgb(243, 243, 243)',
    width: 100,
    textAlign: 'right',
    flexGrow: 0,
    flexShink: 0,
  },
  title: {
    color: 'black',
    padding: 0,
    fontStyle: 'italic',
    fontWeight: 'normal',
    fontSize: '0.9em',
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
