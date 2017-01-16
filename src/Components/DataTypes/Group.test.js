import Microcastle from '../../index.js';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';
import thunk from 'redux-thunk';

import GroupEditor from './Group';

describe('Datatype Group', () => {
  describe('Should Integrate', () => {

    const reducer = combineReducers({
      microcastle: Microcastle.MicrocastleStore.reducer,
    });

    const schema = {
      person: {
        onEdit: sinon.spy((v) => Promise.resolve(v)),
        attributes: {
          name: {
            type: 'group',
            members: {
              first: {type: 'text'},
              last: {type: 'text'},
            }
          }
        }
      } 
    };

    it('Can Edit Members', async () => {
      const store = createStore(reducer, {
        microcastle: I.fromJS({
          data: {
            person: {'bob': {name: {first: 'bob', last: 'bobson'}}},
          },
          editor: {},
        }),
      }, applyMiddleware(thunk));

      const rendered = mount(
          <Provider store={store}>
            <div>
              <Microcastle.MicrocastleEditor schemas={schema} />
              <Microcastle.Button.EditEntry visible={true} schema='person' entry={'bob'} />
            </div>
          </Provider>
      );

      rendered.find(Microcastle.Button.EditEntry).simulate('click');
      rendered.find('textarea').at(0).simulate('change', {target: {value: 'fred'}});
      rendered.find('.microcastle-editor-save').at(0).simulate('click');

      await new Promise(r => setImmediate(r));

      await expect(store.getState().microcastle.getIn(['data', 'person', 'bob', 'name'])).to.equal(new I.Map({first: 'fred', last: 'bobson'}));
    });

    it('Can Edit Members From Blank', async () => {
      const store = createStore(reducer, {
        microcastle: I.fromJS({
          data: {
            person: {'bob': {}},
          },
          editor: {},
        }),
      }, applyMiddleware(thunk));

      const rendered = mount(
          <Provider store={store}>
            <div>
              <Microcastle.MicrocastleEditor schemas={schema} />
              <Microcastle.Button.EditEntry visible={true} schema='person' entry={'bob'} />
            </div>
          </Provider>
      );

      rendered.find(Microcastle.Button.EditEntry).simulate('click');
      rendered.find('textarea').at(0).simulate('change', {target: {value: 'fred'}});
      rendered.find('textarea').at(1).simulate('change', {target: {value: 'bobson'}});
      rendered.find('.microcastle-editor-save').at(0).simulate('click');

      await new Promise(r => setImmediate(r));

      await expect(store.getState().microcastle.getIn(['data', 'person', 'bob', 'name'])).to.equal(new I.Map({first: 'fred', last: 'bobson'}));
    });
  });

  describe('#defaultValue', () => {
    it('should return object with defualt values of members', () => {
      const testSchema = {
        members: {
          first: {type: 'text'},
          last: {type: 'text'},
        }
      };
      const expected = {
        first: '',
        last: '',
      };
      expect(GroupEditor.defaultValue(testSchema)).to.equal(I.fromJS(expected));    
    });  
  });

  describe('#validate', () => {
    it('should return empty array on pass', () => {
      expect(GroupEditor.validate()).to.deep.equal([]);
    });  
  });
});

