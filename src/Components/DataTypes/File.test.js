import Microcastle from '../../index.js';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';
import thunk from 'redux-thunk';

import FileEditor from './File';

const schema = {
    person: {
        onNew:  sinon.spy((v) => Promise.resolve({some: v})),
        onEdit:  sinon.spy((v) => Promise.resolve(v)),
        attributes: {
            file: {
                type: 'file',
            }
        }
    } 
};

describe('Datatype File', () => {
  describe('Should Integrate', () => {

    const reducer = combineReducers({
        microcastle: Microcastle.MicrocastleStore.reducer,
    });

    const store = createStore(reducer, {
        microcastle: I.fromJS({
            data: {
                person: {'1': {file: 'someB64'}},
            },
            editor: {},
        }),
    }, applyMiddleware(thunk));

    it('Can Edit File', async () => {
        const mockFileReader = sinon.stub(global, 'FileReader').returns({
          readAsDataURL: function() {
            this.result = 'someOtherB64';
            this.onload();
          }
        });

        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.Create visible={true} schema='person' />
              </div>
            </Provider>
        );

        rendered.find(Microcastle.Button.Create).simulate('click');
        rendered.find('input').at(0).simulate('change', {target: {files: 'some.file'}});
        rendered.find('.microcastle-editor-save').at(0).simulate('click');

        await new Promise(r => setImmediate(r));

        await expect(store.getState().microcastle.getIn(['data', 'person', 'some', 'file'])).to.equal('someOtherB64');

        mockFileReader.restore();
    });
  });

  describe('#defaultValue', () => {
    it('should return blank string', () => {
      expect(FileEditor.defaultValue(schema.person.attributes.file)).to.equal('');    
    }); 
  });

  describe('#validate', () => {
    it('should return empty array', () => {
      expect(FileEditor.validate(new I.Map(), new I.Map())).to.be.a('array');    
      expect(FileEditor.validate(new I.Map(), new I.Map())).to.have.length(0);    
    });  
  });
});

