import I from 'immutable';
import { save } from './Store';

describe('Store', () => {

  const dispatch = sinon.spy();

  const getState = () => ({
    microcastle: I.fromJS({
      data: {
        news: {
          one: {
            title: 'hello',
            content: 'world',
          }
        },
      },
      editor: {
        action: 'EDIT_ENTRY',
        schema: 'news',
        entry: 'one',
        tempState: {
          news: {
            one: {
              content: 'steve',
            },
          },
        },
      },
    }),
  });

  const schema = {
    news: {
      onEdit: sinon.spy(async (val, info) => {
        return val;
      }),
      attributes: {
        title: {type: 'text', required: true},
        content: {type: 'text', required: true},
      },
    },
  };

  afterEach(() => {
    dispatch.reset();
  })

  describe('save', () => {
    it('dispatches a error report on validation fail', async () => {
      const result = await save(schema)(dispatch, getState);
      return expect(dispatch).to.have.been.calledWith(sinon.match.has('type', 'MICROCASTLE_REPORT_ERRORS'));
    });

    it('dispatches a merge tree on validation succeed', async () => {
      const newSchema = {
        news: {
          onEdit: sinon.spy(async (val, info) => {
            return val;
          }),
          attributes: {
            title: {type: 'text', required: false},
            content: {type: 'text', required: false},
          },
        },
      };
      const result = await save(newSchema)(dispatch, getState);
      return expect(dispatch).to.have.been.calledWith(sinon.match.has('type', 'MICROCASTLE_MERGE_TREE'));
    });
  });
});

