import Microcastle from '../../index.js';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';
import thunk from 'redux-thunk';

import TextEditor from './Text';

const schema = {
    person: {
        onNew:  sinon.spy((v) => Promise.resolve({[v.name]: v})),
        onEdit: sinon.spy((v) => Promise.resolve(v)),
        attributes: {
            name: {
                onChange: sinon.spy((v) => {return Promise.resolve(v);}),
                type: 'text',
            }
        }
    } 
};

describe('Datatype Text', () => {
  describe('Should Integrate', () => {

    const reducer = combineReducers({
        microcastle: Microcastle.MicrocastleStore.reducer,
    });

    const store = createStore(reducer, {
        microcastle: I.fromJS({
            data: {
                person: {'1': {name: 'bob'}},
            },
            editor: {},
        }),
    }, applyMiddleware(thunk));

    it('Can Edit Text', async () => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.EditEntry visible={true} schema='person' entry={'1'} />
              </div>
            </Provider>
        );

        rendered.find(Microcastle.Button.EditEntry).simulate('click');
        rendered.find('textarea').at(0).simulate('change', {target: {value: 'fred'}});
        rendered.find('.microcastle-editor-save').at(0).simulate('click');

        await new Promise(r => setImmediate(r));

        await expect(store.getState().microcastle.getIn(['data', 'person', '1', 'name'])).to.equal('fred');
    });
  });

  describe('#defaultValue', () => {
    it('should return blank string', () => {
      expect(TextEditor.defaultValue(schema.person.attributes.people)).to.equal('');    
    });  
  });

  describe('#validate', () => {
    it('should return empty array on pass', () => {
      expect(TextEditor.validate(new I.Map(), new I.Map())).to.be.a('array');    
      expect(TextEditor.validate(new I.Map(), new I.Map())).to.have.length(0);    
    });  
    
    it('should return array with required if required option passed and empty', () => {
      const schema = {
        onChange: sinon.spy((v) => {return Promise.resolve(v);}),
        type: 'text',
        required: true,
      };
      expect(TextEditor.validate(schema, '')).to.deep.equal(['required']);    
    });  
  });
});

