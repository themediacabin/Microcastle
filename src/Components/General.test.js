import Microcastle from '../index.js';

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
        onNew:  sinon.spy((v) => Promise.resolve({[v.title]: v})),
        onEdit: sinon.spy((v) => Promise.resolve(v)),
        attributes: {
            title: {
                onChange: sinon.spy((v) => {return Promise.resolve(v);}),
                type: 'text',
            },
        }
    }  
};

describe('General', () => {
    afterEach(() => {
      schema.news.onNew.reset();
      schema.news.onEdit.reset();
      schema.news.attributes.title.onChange.reset();
    });

    it('Can Edit Entry', () => new Promise (resolve => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.EditEntry visible={true} schema='news' entry={'1'} />
              </div>
            </Provider>
        );
        rendered.find(Microcastle.Button.EditEntry).simulate('click');
        rendered.find('textarea').simulate('change', {target: {value: 'fred'}});
        rendered.find('button').at(0).simulate('click');
        setTimeout(() => {
          expect(store.getState().microcastle.getIn(['data', 'news', '1', 'title'])).to.equal('fred');
          expect(schema.news.onEdit).to.have.been.calledOnce;
          resolve();
        }, 0);
    }));

    it('Can Edit Attribute', () => new Promise (resolve => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.EditAttribute visible={true} schema='news' entry='1' attribute='title' />
              </div>
            </Provider>
        );
        rendered.find(Microcastle.Button.EditAttribute).simulate('click');
        rendered.find('textarea').simulate('change', {target: {value: 'george'}});
        rendered.find('button').at(0).simulate('click');
        setTimeout(() => {
          expect(store.getState().microcastle.getIn(['data', 'news', '1', 'title'])).to.equal('george');
          expect(schema.news.attributes.title.onChange).to.have.been.calledOnce;
          resolve();
        }, 0);
    }));
  
    it('Can Create New', () => new Promise (resolve => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.Create visible={true} schema='news' />
              </div>
            </Provider>
        );
        rendered.find(Microcastle.Button.Create).simulate('click');
        rendered.find('textarea').simulate('change', {target: {value: 'new'}});
        rendered.find('button').at(0).simulate('click');
        setTimeout(() => {
          expect(schema.news.onNew).to.have.been.calledTwice;
          expect(store.getState().microcastle.getIn(['data', 'news', 'new', 'title'])).to.equal('new');
          resolve();
        }, 0);
    }));
});

