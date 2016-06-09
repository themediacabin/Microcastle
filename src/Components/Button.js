import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Store from '../Store/Store';

import PencilIcon from 'react-icons/lib/fa/pencil';


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
  },
  icon: {
    marginTop: -2,
    marginRight: 2,
  }
}

class CreateButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    if (!this.props.visible) return null;

    return <button style={style.button} onClick={_ => this.props.dispatch(Store.actions.createNew(this.props.schema))}>
      <PencilIcon style={style.icon} />
      {text}
    </button>  
  }  
}

class EditEntryButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    if (!this.props.visible) return null;

    return <button style={style.button} onClick={_ => this.props.dispatch(Store.actions.editEntry(this.props.schema, this.props.entry))}>
      <PencilIcon style={style.icon} />
      {text}
    </button>  
  }  
}

class EditAttributeButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    if (!this.props.visible) return null;
    
    return <button style={style.button} onClick={_ => this.props.dispatch(Store.actions.editSingle(this.props.schema, this.props.entry, this.props.attribute))}>
      <PencilIcon style={style.icon} />
      {text}
    </button>  
  }  
}

class EditPartButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    if (!this.props.visible) return null;
    
    return <button style={style.button} onClick={_ => this.props.dispatch(Store.actions.editPart(this.props.schema, this.props.entry, this.props.attribute, this.props.part))}>
      <PencilIcon style={style.icon} />
      {text}
    </button>  
  }  
}

class BaseButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    if (!this.props.visible) return null;
    
    return <button style={style.button} onClick={this.props.onClick}>
      <PencilIcon style={style.icon} />
      {text}
    </button>  
  }  
}

const connectedCreateButton = connect()(CreateButton);
const connectedEditEntryButton = connect()(EditEntryButton);
const connectedEditAttributeButton = connect()(EditAttributeButton);
const connectedEditPartButton = connect()(EditPartButton);

export default {
  Create: connectedCreateButton,
  EditEntry: connectedEditEntryButton,
  EditAttribute: connectedEditAttributeButton,
  EditPart: connectedEditPartButton,
  Base: BaseButton,
}

export {
  connectedCreateButton as CreateButton,
  connectedEditEntryButton as EditEntryButton,
  connectedEditAttributeButton as AttributeButton,
  connectedEditPartButton as EditPartButton,
  BaseButton as BaseButton,
}
