import I from 'immutable';
import { validateTree, validateEntry, saveChangeState, saveIndividualNew, saveNewState } from './DiffTree';

describe('DiffTree', () => {
  
  const schema = {
    news: {
      onEdit: sinon.spy(async (val, info) => {
        return val;
      }),
      onNew: sinon.spy(async (val) => {
        return {[val.title]: val}
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

    it('Should overwrite changes', async () => {
      const microcastle = I.fromJS({
        data: {
          news: {
            test: {
              title: 'hello',
              content: 'world',
            }
          }
        },
        editor: {
          newState: [],
          tempState: {
            news: {
              test: {
                title: 'woah',
                content: 'hello world',
              }
            }
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
      
      await expect(saveChangeState(microcastle, schema)).to.eventually.equal(expected);    
    });

    it('Should be able to create state state', async () => {
      const microcastle = I.fromJS({
        data: {
          news: {
            test: {
              title: 'hello',
              content: 'world',
            }
          }
        },
        editor: {
          newState: [],
          tempState: {
            news: {
              new: {
                title: 'helloworld',
                content: 'helloworld',
              }
            }
          }
        }
      });

      const expected = I.fromJS({
        news: {
          new: {
            title: 'helloworld',
            content: 'helloworld',
          },
          test: {
            title: 'hello',
            content: 'world'
          }
        }
      });
      
      await expect(saveChangeState(microcastle, schema)).to.eventually.equal(expected);    
    });

    it('Should preserve unchanged state', async () => {
      const microcastle = I.fromJS({
        data: {
          news: {
            test: {
              title: 'hello',
              content: 'world',
            }
          }
        },
        editor: {
          newState: [],
          tempState: {
            news: {
              test: {
                content: 'hello world',
              }
            }
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
      
      await expect(saveChangeState(microcastle, schema)).to.eventually.equal(expected);    
    });

    it('Should call onEdit of all Entries with new state', async () => {
      const microcastle = I.fromJS({
        data: {
          news: {
            test: {
              title: 'hello',
              content: 'world',
            }
          }
        },
        editor: {
          newState: [],
          tempState: {
            news: {
              test: {
                content: 'hello world',
              }
            }
          }
        }
      });

      await saveChangeState(microcastle, schema);
      expect(schema.news.onEdit).to.have.been.calledOnce;
    });
  });

  describe('saveIndividualNew', () => {
    it('return the changeState with the new entry', async () => {

      const state = I.fromJS({
        id: 13918409182409180,
        type: 'news',
        data: {
          title: 'hello',
          content: 'world'
        }
      });

      const changeState = I.fromJS({
        news: {
          one: {
            title: 'hello',
            content: 'world',
          }
        }
      });

      const expected = I.fromJS({
        news: {
          one: {
            title: 'hello',
            content: 'world',
          },
          hello: {
            title: 'hello',
            content: 'world',
          }
        }
      });

      const result = await saveIndividualNew(state, changeState, schema);

      expect(result.changeState).to.equal(expected);

    });

    it('return the newState with the new entryID and same id', async () => {
      const state = I.fromJS({
        id: 13918409182409180,
        type: 'news',
        data: {
          title: 'hello',
          content: 'world'
        }
      });

      const changeState = I.fromJS({
        news: {
          one: {
            title: 'hello',
            content: 'world',
          }
        }
      });

      const result = await saveIndividualNew(state, changeState, schema);

      expect(result.newState).to.have.property('id', 13918409182409180);
      expect(result.newState).to.have.property('created', true);
      expect(result.newState).to.have.property('entryID', 'hello');
    });
  });

  describe('saveNewState', () => {
    it('should return new changeState', async () => {

      const state = I.fromJS([{
        id: 12,
        type: 'news',
        data: {
          title: 'hello',
          content: 'world'
        }
      }, {
        id: 12,
        type: 'news',
        data: {
          title: 'what',
          content: 'world'
        }
      }]);

      const changeState = I.fromJS({
        news: {
          one: {
            title: 'hello',
            content: 'world',
          }
        }
      });

      const expected = I.fromJS({
        news: {
          one: {
            title: 'hello',
            content: 'world',
          },
          hello: {
            title: 'hello',
            content: 'world',
          },
          what: {
            title: 'what',
            content: 'world',
          }
        }
      });

      const result = await saveNewState(state, changeState, schema);
      expect(result.changeState).to.equal(expected);
    });

    it('should return altered newState', async () => {

      const state = I.fromJS([{
        id: 12,
        type: 'news',
        data: {
          title: 'hello',
          content: 'world'
        }
      }, {
        id: 13,
        type: 'news',
        data: {
          title: 'what',
          content: 'world'
        }
      }]);

      const changeState = I.fromJS({
        news: {
          one: {
            title: 'hello',
            content: 'world',
          }
        }
      });

      const expected = I.fromJS([{
        id: 12,
        created: true,
        entryID: 'hello',
      }, {
        id: 13,
        created: true,
        entryID: 'what',
      }]);

      const result = await saveNewState(state, changeState, schema);
      expect(result.newState).to.equal(expected);
    });
  });

});

