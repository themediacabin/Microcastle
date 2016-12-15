import Microcastle from '../../index.js';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';
import thunk from 'redux-thunk';

import RelationEditor from './Relation';

const schema = {
    team: {
        onNew:  sinon.spy((v) => Promise.resolve({[v.title]: v})),
        onEdit: sinon.spy((v) => Promise.resolve(v)),
        attributes: {
            title: {
                onChange: sinon.spy((v) => Promise.resolve(v)),
                type: 'text',
            },
        }
    },
    person: {
        onNew:  sinon.spy((v) => Promise.resolve({[v.name]: v})),
        onEdit: sinon.spy((v) => Promise.resolve(v)),
        attributes: {
            name: {
                onChange: sinon.spy((v) => {return Promise.resolve(v);}),
                type: 'text',
            },
            team: {
                onChange: sinon.spy((v) => {return Promise.resolve(v);}),
                type: 'relation',
                relative: 'team'
            },
        }
    } 
};

describe('Datatype Relation', () => {
  describe('Should Integrate', () => {

    const reducer = combineReducers({
        microcastle: Microcastle.MicrocastleStore.reducer,
    });

    const store = createStore(reducer, {
        microcastle: I.fromJS({
            data: {
                person: {'1': {name: 'bob', team: 'bobsteam'}},
                team: {'bobsteam': {title: 'bobsteam'}},
            },
            editor: {},
        }),
    }, applyMiddleware(thunk));

    it('Can Create New Entry From Relation Field', async () => {
        const rendered = mount(
            <Provider store={store}>
              <div>
                <Microcastle.MicrocastleEditor schemas={schema} />
                <Microcastle.Button.EditEntry visible={true} schema='person' entry={'1'} />
              </div>
            </Provider>
        );

        rendered.find(Microcastle.Button.EditEntry).simulate('click');
        rendered.find('.microcastle-relation-reselect').simulate('click');
        rendered.find('.microcastle-relation-create').simulate('click');
        rendered.find('textarea').at(1).simulate('change', {target: {value: 'fredsteam'}});
        rendered.find('.microcastle-editor-save').at(0).simulate('click');

        await new Promise(r => setImmediate(r));

        await expect(schema.team.onNew).to.have.been.calledOnce;
        await expect(store.getState().microcastle.getIn(['data', 'team']).size).to.equal(2);
    });
  });

  describe('#defaultValue', () => {
    it('should return null', () => {
      expect(RelationEditor.defaultValue(schema.person.attributes.team)).to.equal(null);    
    });  
  });

  describe('#validate', () => {
    it('should return empty array on pass', () => {
      expect(RelationEditor.validate(new I.Map(), new I.Map())).to.be.a('array');    
      expect(RelationEditor.validate(new I.Map(), new I.Map())).to.have.length(0);    
    });  
  });

  describe('#beforeSave', () => {
    it('if value is not a view, return it', () => {
      const view = I.fromJS({state: 'change', type: 'person', entry: '1', attribute: 'team'});
      const state = I.fromJS({
        data: {
            person: {'1': {name: 'bob', team: 'bobsteam'}},
            team: {'bobsteam': {title: 'bobsteam'}},
        },
        editor: {},
      });

      expect(RelationEditor.beforeSave(state, view)).to.equal('bobsteam');
    });  

    it('if value is a view, return the entryID it created', () => {
      const view = I.fromJS({state: 'change', type: 'person', entry: '1', attribute: 'team'});
      const state = I.fromJS({
        data: {
          person: {'1': {name: 'bob', team: {state: 'new', entry: '22'}}},
          team: {'bobsteam': {title: 'bobsteam'}},
        },
        editor: {
          newState: [{id: '22', created: true, entryID: 'hello'}]
        },
      });

      expect(RelationEditor.beforeSave(state, view)).to.equal('hello');
    });
  });
});

