import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Store from '../Store/Store';


const style = {
  button: {
    background: '#F57F61',
    color: 'white',
    fontSize: 12,
    borderRadius: 4,
    padding: '2px 4px',
    border: 'none',
    cursor: 'pointer',
    margin: 2,
  }
} 

class CreateButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    return !this.props.visible ? null : <button style={style.button} onClick={_ => this.props.dispatch(Store.actions.createNew(this.props.schema))}>{text}</button>  
  }  
}

class EditEntryButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    return !this.props.visible ? null : <button style={style.button} onClick={_ => this.props.dispatch(Store.actions.editEntry(this.props.schema, this.props.entry))}>{text}</button>  
  }  
}

class EditAttributeButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    return !this.props.visible ? null : <button style={style.button} onClick={_ => this.props.dispatch(Store.actions.editSingle(this.props.schema, this.props.entry, this.props.attribute))}>{text}</button>  
  }  
}

const connectedCreateButton = connect()(CreateButton);
const connectedEditEntryButton = connect()(EditEntryButton);
const connectedEditAttributeButton = connect()(EditAttributeButton);

export default {
  Create: connectedCreateButton,
  EditEntry: connectedEditEntryButton,
  EditAttribute: connectedEditAttributeButton,
}

export {
  connectedCreateButton as EditAttributeButton,
  connectedEditEntryButton as EditEntryButton,
  connectedEditAttributeButton as AttributeButton,
}
