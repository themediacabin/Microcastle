import I from 'immutable';
import { validateTree, validateEntry, saveChangeState } from './DiffTree';

describe('DiffTree', () => {
  
  const schema = {
    news: {
      onEdit: sinon.spy(async (val, info) => {
        return val;
      }),
      attributes: {
        title: {type: 'text', required: true},
        content: {type: 'text', required: true},
      }
    }
  }

  afterEach(function() {
    schema.news.onEdit.reset();
  });

  describe('validateEntry', () => {
    it('Should return an empty array on pass', () => {
      const diff = I.fromJS({
        title: 'hello',
        content: 'text',
      });
      expect(validateEntry(schema.news, diff)).to.deep.equal([]);
    });

    it('should return an array of errors on fail', () => {
      const diff = I.fromJS({
        title: '',
      });
      expect(validateEntry(schema.news, diff)).to.have.lengthOf(2);
    });
  });

  describe('validateTree', () => {
    it('Should return an empty array on pass', () => {
      const diffTree = I.fromJS({
        news: {
          test: {
            title: 'hello',
            content: 'text',
          },
        },      
      });
      expect(validateTree(schema, diffTree)).to.deep.equal([]);
    });

    it('should return an array of errors on fail', () => {
      const diffTree = I.fromJS({
        news: {
          test: {
            content: '',
          },
        },      
      });
      expect(validateTree(schema, diffTree)).to.have.lengthOf(2);
    });
  });

  describe('saveChangeState', () => {
    const originalState = I.fromJS({
      news: {
        test: {
          title: 'hello',
          content: 'world',
        }
      }
    });

    it('Should overwrite changes', async () => {
      const changeState = I.fromJS({
        news: {
          test: {
            title: 'woah',
            content: 'hello world',
          }
        }
      });

      const expected = I.fromJS({
        news: {
          test: {
            title: 'woah',
            content: 'hello world'
          }
        }
      });
      
      await expect(saveChangeState(changeState, originalState, schema)).to.eventually.equal(expected);    
    });

    it('Should preserve unchanged state', async () => {
      const changeState = I.fromJS({
        news: {
          test: {
            content: 'hello world',
          }
        }
      });

      const expected = I.fromJS({
        news: {
          test: {
            title: 'hello',
            content: 'hello world'
          }
        }
      });
      
      await expect(saveChangeState(changeState, originalState, schema)).to.eventually.equal(expected);    
    });

    it('Should call onEdit of all Entries with new state', async () => {
      const changeState = I.fromJS({
        news: {
          test: {
            content: 'hello world',
          }
        }
      });

      await saveChangeState(changeState, originalState, schema);
      expect(schema.news.onEdit).to.have.been.calledOnce;
    });
  });

});

