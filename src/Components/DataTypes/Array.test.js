import Microcastle from '../../index.js';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';
import thunk from 'redux-thunk';

import { ArrayEditor, NewItemButton } from './Array';


describe('Datatype Array', () => {
  describe('Should Integrate', () => {
    it('Can Edit Array', async () => {
      const reducer = combineReducers({
        microcastle: Microcastle.MicrocastleStore.reducer,
      });

      const schema = {
        person: {
          onNew:  sinon.spy((v) => Promise.resolve({[v.name]: v})),
          onEdit: sinon.spy((v) => Promise.resolve(v)),
          attributes: {
            friends: {
              onChange: sinon.spy((v) => {return Promise.resolve(v);}),
              type: 'array',
              subtype: {type: 'text'},
            }
          }
        } 
      };

      const store = createStore(reducer, {
        microcastle: I.fromJS({
          data: {
            person: {'bob': {friends: ['mary', 'bob']}},
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
      rendered.find(NewItemButton).find('button').simulate('click');
      rendered.find('textarea').at(0).simulate('change', {target: {value: 'fred'}});
      rendered.find('.microcastle-editor-save').at(0).simulate('click');

      await new Promise(r => setImmediate(r));

      await expect(store.getState().microcastle.getIn(['data', 'person', 'bob', 'friends'])).to.equal(new I.List(['fred', 'mary', 'bob']));
    });
  });

  describe('#defaultValue', () => {
    it('should return empty array', () => {
      expect(ArrayEditor.defaultValue()).to.deep.equal([]);
    });
  });

  describe('#validate', () => {
    it('should return empty array on pass', () => {
      expect(ArrayEditor.validate({}, [])).to.deep.equal([]);
    });

    it('should return array of required when required is set and no value', () => {
      expect(ArrayEditor.validate({required: true}, [])).to.deep.equal(['required']);
    });
  });
});

