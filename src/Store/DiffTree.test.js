import I from 'immutable';
import { validateTree, saveTree } from './DiffTree';

describe('DiffTree', () => {
  
  const schema = {
    news: {
      onEdit: async (val, info) => {
        return val;
      },
      attributes: {
        title: {type: 'text', required: true},
        content: {type: 'text', required: true},
      }
    }
  }


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

  describe('saveTree', () => {
    it('Should return an the saved tree on pass', async () => {
      const editor = I.fromJS({
        schema: 'news',
        entry: 'test',
        action: 'EDIT_SINGLE',
        tempState: {
          news: {
            test: {
              title: 'hello',
              content: 'text',
            },
          },
        }
      });
      await expect(saveTree(schema, editor)).to.eventually.equal(editor.get('tempState'));
    });
  });
});

