import Microcastle from '../../index.js';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';
import thunk from 'redux-thunk';

import MarkdownEditor from './Markdown';

const schema = {
    person: {
        onNew:  sinon.spy((v) => Promise.resolve({[v.name]: v})),
        onEdit: sinon.spy((v) => Promise.resolve(v)),
        attributes: {
            bio: {
                onChange: sinon.spy((v) => {return Promise.resolve(v);}),
                type: 'markdown',
            }
        }
    } 
};

describe('Datatype Markdown', () => {
  describe('#defaultValue', () => {
    it('should return blank string', () => {
      expect(MarkdownEditor.defaultValue(schema.person.attributes.people)).to.equal('');    
    });  
  });

  describe('#validate', () => {
    it('should return empty array on pass', () => {
      expect(MarkdownEditor.validate(new I.Map(), new I.Map())).to.be.a('array');    
      expect(MarkdownEditor.validate(new I.Map(), new I.Map())).to.have.length(0);    
    });  
    
    it('should return array with required if required option passed and empty', () => {
      const schema = {
        onChange: sinon.spy((v) => {return Promise.resolve(v);}),
        type: 'markdown',
        required: true,
      };
      expect(MarkdownEditor.validate(schema, '')).to.deep.equal(['required']);    
    });  
  });
});


