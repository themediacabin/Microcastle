import Microcastle from '../../index.js';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';
import thunk from 'redux-thunk';

import SelectEditor from './select';

const schema = {
    person: {
        onNew:  sinon.spy((v) => Promise.resolve({[v.name]: v})),
        onEdit: sinon.spy((v) => Promise.resolve(v)),
        attributes: {
            name: {
                type: 'select',
                choices: ['hello', 'howdy', 'yo'],
            }
        }
    } 
};

describe('Datatype Select', () => {
  describe('Should Integrate', () => {

    const reducer = combineReducers({
        microcastle: Microcastle.MicrocastleStore.reducer,
    });

    const store = createStore(reducer, {
        microcastle: I.fromJS({
            data: {
                person: {'1': {greeting: 'howdy'}},
            },
            editor: {},
        }),
    }, applyMiddleware(thunk));

    it('Can Edit Select', async () => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.EditEntry visible={true} schema='person' entry={'1'} />
              </div>
            </Provider>
        );

        rendered.find(Microcastle.Button.EditEntry).simulate('click');
        rendered.find('select').at(0).simulate('change', {target: {value: 'howdy'}});
        rendered.find('.microcastle-editor-save').at(0).simulate('click');

        await new Promise(r => setImmediate(r));

        await expect(store.getState().microcastle.getIn(['data', 'person', '1', 'greeting'])).to.equal('howdy');
    });
  });

  describe('#defaultValue', () => {
    it('should return blank string', () => {
      expect(SelectEditor.defaultValue(schema.person.attributes.people)).to.equal('');    
    });  
  });

  describe('#validate', () => {
    it('should return empty array on pass', () => {
      expect(SelectEditor.validate(new I.Map(), new I.Map())).to.be.a('array');    
      expect(SelectEditor.validate(new I.Map(), new I.Map())).to.have.length(0);    
    });  
    
    it('should return array with required if required option passed and empty', () => {
      const schema = {
        type: 'select',
        required: true,
      };
      expect(SelectEditor.validate(schema, '')).to.deep.equal(['required']);    
    });  
  });
});

