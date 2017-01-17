import Microcastle from '../../index.js';
import ItemFrame from '../ItemFrame.js';
import thunk from 'redux-thunk';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';

describe('Part Editor', () => {

  const reducer = combineReducers({
      microcastle: Microcastle.MicrocastleStore.reducer,
  });

  const store = createStore(reducer, {
      microcastle: I.fromJS({
          data: {
            news: {'brexit': {tags: ['pain', 'suffering', 'racism']}}
          },
          editor: {},
      }),
  }, applyMiddleware(thunk));

  const schema = {
      news: {
          onEdit: sinon.spy(f => new Promise(r => r(f))),
          attributes: {
             tags: { type: 'array', subtype: {type: 'text'} },
          }
      }  
  };

    it('Should display correct name in ItemFrame', () => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.EditPart visible={true} schema='news' entry="brexit" attribute="tags" part={[1]} />
              </div>
            </Provider>
        );
        rendered.find(Microcastle.Button.EditPart).simulate('click');
        expect(rendered.find(ItemFrame).findWhere((s) => s.prop('title') == 'tags').length).to.equal(1);
    });

    it('Should be able to change part', async () => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.EditPart visible={true} schema='news' entry="brexit" attribute="tags" part={[1]} />
              </div>
            </Provider>
        );
        rendered.find(Microcastle.Button.EditPart).simulate('click');
        rendered.find('textarea').at(0).simulate('change', {target: {value: 'dispair'}});
        rendered.find('.microcastle-editor-save').at(0).simulate('click');

        await new Promise(r => setImmediate(r));

        await expect(schema.news.onEdit).to.have.been.calledOnce;

        await expect(store.getState().microcastle.getIn(['data', 'news', 'brexit', 'tags', 1])).to.equal('dispair');
    });
});

