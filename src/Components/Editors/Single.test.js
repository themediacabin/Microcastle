import Microcastle from '../../index.js';
import ItemFrame from '../ItemFrame.js';

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';

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
});

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

describe('Single Editor', () => {
    it('Should display correct name in ItemFrame', () => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.EditAttribute visible={true} schema='news' entry="1" attribute='title' />
              </div>
            </Provider>
        );
        rendered.find(Microcastle.Button.EditAttribute).simulate('click');
        expect(rendered.find(ItemFrame).findWhere((s) => s.prop('title') == 'hello').length).to.equal(1);
    });
});

