import Microcastle from '../../index.js';
import ItemFrame from '../ItemFrame.js';
import thunk from 'redux-thunk';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';

describe('Entry Editor', () => {

  const reducer = combineReducers({
      microcastle: Microcastle.MicrocastleStore.reducer,
  });

  const store = createStore(reducer, {
      microcastle: I.fromJS({
          data: {
            news: {'1': {title: 'hi', story: 'boo'}}
          },
          editor: {},
      }),
  }, applyMiddleware(thunk));

  const schema = {
      news: {
          attributes: {
              title: {
                  name: 'hello',
                  type: 'text',
              },
              story: {
                  type: 'text',
              },
          }
      }  
  };

    it('Should display correct name in ItemFrame', () => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.EditEntry visible={true} schema='news' entry="1" />
              </div>
            </Provider>
        );
        rendered.find(Microcastle.Button.EditEntry).simulate('click');
        expect(rendered.find(ItemFrame).findWhere((s) => s.prop('title') == 'hello').length).to.equal(1);
        expect(rendered.find(ItemFrame).findWhere((s) => s.prop('title') == 'story').length).to.equal(1);
    });
});

