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

    afterEach(() => {
      schema.team.onNew.reset();
    });


    it('Can Create New Entry From Relation Field', async () => {
        const store = createStore(reducer, {
            microcastle: I.fromJS({
                data: {
                    person: {'1': {name: 'bob', team: 'bobsteam'}},
                    team: {'bobsteam': {title: 'bobsteam'}},
                },
                editor: {},
            }),
        }, applyMiddleware(thunk));

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

    it('When You Go To Create A New Entry But Then Reselect It Should Not Save New Entry', async () => {
        const store = createStore(reducer, {
            microcastle: I.fromJS({
                data: {
                    person: {'1': {name: 'bob', team: 'bobsteam'}},
                    team: {'bobsteam': {title: 'bobsteam'}},
                },
                editor: {},
            }),
        }, applyMiddleware(thunk));

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
        rendered.find('.microcastle-relation-reselect').simulate('click');
        rendered.find('.microcastle-relation-option').simulate('click');
        rendered.find('.microcastle-editor-save').at(0).simulate('click');

        await new Promise(r => setImmediate(r));

        await expect(schema.team.onNew).to.not.have.been.called;
        await expect(store.getState().microcastle.getIn(['data', 'team']).size).to.equal(1);
    });

    it('Can Delete Entry', async () => {
      const schema = {
          team: {
              onNew:    sinon.spy((v) => Promise.resolve({[v.title]: v})),
              onDelete: sinon.spy(() => Promise.resolve()),
              onEdit:   sinon.spy((v) => Promise.resolve(v)),
              attributes: {
                  title: {
                      type: 'text',
                  },
              }
          },
          person: {
              onEdit: sinon.spy((v) => Promise.resolve(v)),
              attributes: {
                  teams: { type: 'array', subtype: { 
                        type: 'relation',
                        relative: 'team'
                  } },
              }
          } 
      };

      const store = createStore(reducer, {
          microcastle: I.fromJS({
              data: {
                  person: {'1': {name: 'bob', teams: ['bobsteam']}},
                  team: {'bobsteam': {title: 'bobsteam'}},
              },
              editor: {},
          }),
      }, applyMiddleware(thunk));

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
      rendered.find('.microcastle-relation-delete').simulate('click');
      rendered.find('.microcastle-editor-save').at(0).simulate('click');

      await new Promise(r => setImmediate(r));

      await expect(schema.team.onDelete).to.have.been.called;
      await expect(store.getState().microcastle.getIn(['data', 'team']).size).to.equal(0);
    });

    describe('When In An Array', async () => {

      const schema = {
          team: {
              onNew:  sinon.spy((v) => Promise.resolve({[v.title]: v})),
              onEdit: sinon.spy((v) => Promise.resolve(v)),
              attributes: {
                  title: {
                      type: 'text',
                  },
              }
          },
          person: {
              onEdit: sinon.spy((v) => Promise.resolve(v)),
              attributes: {
                  name: {
                      type: 'text',
                  },
                  teams: { type: 'array', subtype: { 
                        type: 'relation',
                        relative: 'team'
                  } },
              }
          } 
      };

      const store = createStore(reducer, {
          microcastle: I.fromJS({
              data: {
                  person: {'1': {name: 'bob', teams: ['bobsteam']}},
                  team: {'bobsteam': {title: 'bobsteam'}},
              },
              editor: {},
          }),
      }, applyMiddleware(thunk));

      const rendered = mount(
          <Provider store={store}>
            <div>
              <Microcastle.MicrocastleEditor schemas={schema} />
              <Microcastle.Button.EditEntry visible={true} schema='person' entry={'1'} />
            </div>
          </Provider>
      );

      afterEach(() => {
        schema.team.onNew.reset();
      });

      it('When You Go To Create A New Entry In An Array But Then Delete The Item, It Should Not Save New Entry', async () => {
          rendered.find(Microcastle.Button.EditEntry).simulate('click');
          rendered.find('.microcastle-relation-reselect').simulate('click');
          rendered.find('.microcastle-relation-create').simulate('click');
          rendered.find('textarea').at(1).simulate('change', {target: {value: 'fredsteam'}});
          rendered.find('.microcastle-array-remove').simulate('click');
          rendered.find('.microcastle-editor-save').at(0).simulate('click');

          await new Promise(r => setImmediate(r));

          await expect(schema.team.onNew).to.not.have.been.called;
          await expect(store.getState().microcastle.getIn(['data', 'team']).size).to.equal(1);
      });

      it('When You Go To Create A New Entry In An Array When You Save, Save New Entry', async () => {
          rendered.find(Microcastle.Button.EditEntry).simulate('click');
          rendered.find('.microcastle-relation-reselect').simulate('click');
          rendered.find('.microcastle-relation-create').simulate('click');
          rendered.find('textarea').at(1).simulate('change', {target: {value: 'fredsteam'}});
          rendered.find('.microcastle-editor-save').at(0).simulate('click');

          await new Promise(r => setImmediate(r));

          await expect(schema.team.onNew).to.have.been.called;
          await expect(store.getState().microcastle.getIn(['data', 'team']).size).to.equal(2);
      });
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

  describe('#getChildren', () => {
    
    const schema = {
      person: {attributes: {team: {type: 'relation', relative: 'team'}}},
      team: {attributes: {name: {type: 'string'}}}
    };

    it('should return array of child views attributes when changing state', () => {
      const view = I.fromJS({state: 'change', type: 'person', entry: 'bob', attribute: 'team'});
      const microcastle = I.fromJS({
        data: {
          person: {
            bob: {
              team: 'bobsteam'
            }
          }
        }
      });
      const expected = [I.fromJS({state: 'change', type: 'team', entry: 'bobsteam', attribute: 'name'})];
      
      expect(I.fromJS(RelationEditor.getChildren(schema, view, microcastle))).to.equal(I.fromJS(expected));
    });  

    it('should return array of child views attributes when creating state', () => {
      const view = I.fromJS({state: 'change', type: 'person', entry: 'bob', attribute: 'team'});
      const microcastle = I.fromJS({
        editor: {
          tempState: {
            person: {
              bob: {
                team: {state: 'new', type: 'team', entry: '1234'}
              }
            }
          }
        }
      });
      const expected = [I.fromJS({state: 'new', type: 'team', entry: '1234', attribute: 'name'})];
      
      expect(I.fromJS(RelationEditor.getChildren(schema, view, microcastle))).to.equal(I.fromJS(expected));
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

