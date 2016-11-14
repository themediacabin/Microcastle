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
            news: {'1': {title: 'bob'}},
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

describe('New Editor', () => {
    it('Should display correct name in ItemFrame', () => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.Create visible={true} schema='news' />
              </div>
            </Provider>
        );
        rendered.find(Microcastle.Button.Create).simulate('click');
        expect(rendered.find(ItemFrame).findWhere((s) => s.prop('title') == 'hello').length).to.equal(1);
        expect(rendered.find(ItemFrame).findWhere((s) => s.prop('title') == 'story').length).to.equal(1);
    });
});

