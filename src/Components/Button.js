/** 
 * @module Buttons
 */

import React from 'react';
import { connect } from 'react-redux';
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
};

class CreateButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    if (!this.props.visible) return null;

    return <button style={style.button} onClick={() => this.props.dispatch(Store.actions.createNew(this.props.schema))}>
      <PencilIcon style={style.icon} />
      {text}
    </button>;
  }  
}

class EditEntryButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    if (!this.props.visible) return null;

    return <button style={style.button} onClick={() => this.props.dispatch(Store.actions.editEntry(this.props.schema, this.props.entry))}>
      <PencilIcon style={style.icon} />
      {text}
    </button>;
  }  
}

class EditAttributeButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    if (!this.props.visible) return null;
    
    return <button style={style.button} onClick={() => this.props.dispatch(Store.actions.editSingle(this.props.schema, this.props.entry, this.props.attribute))}>
      <PencilIcon style={style.icon} />
      {text}
    </button>;
  }  
}

class EditPartButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    if (!this.props.visible) return null;
    
    return <button style={style.button} onClick={() => this.props.dispatch(Store.actions.editPart(this.props.schema, this.props.entry, this.props.attribute, this.props.part))}>
      <PencilIcon style={style.icon} />
      {text}
    </button>;
  }  
}

class BaseButton extends React.Component {
  render() {
    const text = this.props.text ? this.props.text : 'Edit';
    if (!this.props.visible) return null;
    
    return <button style={style.button} onClick={this.props.onClick}>
      <PencilIcon style={style.icon} />
      {text}
    </button>;
  }  
}

const connectedCreateButton = connect()(CreateButton);
const connectedEditEntryButton = connect()(EditEntryButton);
const connectedEditAttributeButton = connect()(EditAttributeButton);
const connectedEditPartButton = connect()(EditPartButton);

export default {
  /** 
   * Button that opens the editor creating a new entry in a schema
   * @property {string} text The text to display in the button
   * @property {boolean} visible Should the button be drawn at all
   * @property {string} schema The schema to create a new entry in
   */
  Create: connectedCreateButton,

  /** 
   * Button that opens the editor editing an entry in a schema
   * @property {string} text The text to display in the button
   * @property {boolean} visible Should the button be drawn at all
   * @property {string} schema The schema of the entry to edit
   * @property {string} entry The entry to edit
   */
  EditEntry: connectedEditEntryButton,

  /** 
   * Button that opens the editor editing an attribute in an entry
   * @property {string} text The text to display in the button
   * @property {boolean} visible Should the button be drawn at all
   * @property {string} schema The schema of the entry to edit
   * @property {string} entry The entry to edit
   * @property {string} attribute The attribute to edit
   */

  EditAttribute: connectedEditAttributeButton,
  /** 
   * Button that opens the editor editing a part of an attribute in an entry
   * @property {string} text The text to display in the button
   * @property {boolean} visible Should the button be drawn at all
   * @property {string} schema The schema of the entry to edit
   * @property {string} entry The entry to edit
   * @property {string} attribute The attribute to edit
   * @property {string|number|array} part The part of the attribute to edit
   */
  EditPart: connectedEditPartButton,


  /** 
   * Button that is styled to look like other microcastle buttons but can do anything
   * @property {string} text The text to display in the button
   * @property {boolean} visible Should the button be drawn at all
   * @property {function} onClick function to executre when clicked
   */
  Base: BaseButton,
};

export {
  connectedCreateButton as CreateButton,
  connectedEditEntryButton as EditEntryButton,
  connectedEditAttributeButton as AttributeButton,
  connectedEditPartButton as EditPartButton,
  BaseButton as BaseButton,
};
