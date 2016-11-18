import Microcastle from '../../index.js';

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import I from 'immutable';

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
});

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
        rendered.find('.microcastle-relation-save').simulate('click');
        rendered.find('.microcastle-editor-save').at(0).simulate('click');

        await new Promise(r => setImmediate(r));

        expect(schema.team.onNew).to.have.been.calledOnce;
        expect(store.getState().microcastle.getIn(['data', 'team']).size).to.equal(2);
    });
});

