import React from 'react';

const style = {
  content: {
    minWidth: '80%',
    minHeight: '80vh',
  },
  background: {
    background: 'rgba(0, 0, 0, 0.5)',
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '99999999',
  },
  modal: {
    background: 'white',
    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    maxWidth: 1200,
    width: '90%',
    height: '90%',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '\'Helvetica Neue\', Helvetica, Arial, sans-serif'
  },
  header: {
    background: 'white',
    padding: 20,
    color: '#F57F61',
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerButton: {
    background: '#F57F61',
    color: 'white',
    margin: 5,
    borderRadius: 3,
    marginBottom: 0,
    fontSize: '0.9em',
    padding: '5px 10px',
    border: 'none',
    cursor: 'pointer',
  },
  headerTitle: {
    padding: 0,
    margin: 0,
  },
  body: {
    flex: '1 1 1px',
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
  },
  padding: {
    flex: '1 1 1px',
    background: 'white',
    display: 'flex',
  },
  paddingColor: {
    background: 'white',
    width: 100,
    flexGrow: 0,
    flexShink: 0,
  }
};

class EditorFrame extends React.Component {
  render() {
    if (!this.props.open) return null;

    return <div style={style.background}>
      <div style={style.modal}>
        <div style={style.header}>
          <h2 style={style.headerTitle}>{this.props.title}</h2>
          <div>
            <button style={style.headerButton} onClick={this.props.onSubmit}>Save</button>
            <button style={style.headerButton} onClick={this.props.onCancel}>Close</button>
          </div>
        </div>
        <div style={style.body}>
          {this.props.children}
          <div style={style.padding}>
            <div style={style.paddingColor}></div>
            <div></div>
          </div>
        </div>
      </div>
    </div>;
  }
}

export default EditorFrame;
