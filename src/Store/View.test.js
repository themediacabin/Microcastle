import I from 'immutable';
import { getViewValue, changeViewValue, getSchemaFromView } from './View';

describe('View', () => {
  describe('getViewValue', () => {
    it('can get an attribute value from saved state', () => {
      const microcastleState = I.fromJS({
        data: {
          news: {
            one: {
              title: 'hello',
              content: 'world',
            },
          },
        },
      });

      const view = I.fromJS({
        type: 'news',
        state: 'change',
        entry: 'one',
        attribute: 'title'
      });

      expect(getViewValue(microcastleState, view)).to.equal('hello');
    });

    it('can get an attribute value from changed state', () => {
      const microcastleState = I.fromJS({
        data: {
          news: {
            one: {
              title: 'hello',
              content: 'world',
            },
          },
        },
        editor: {
          tempState: {
            news: {
              one: {
                title: 'peter',
              }
            }
          }
        }
      });

      const view = I.fromJS({
        type: 'news',
        state: 'change',
        entry: 'one',
        attribute: 'title'
      });

      expect(getViewValue(microcastleState, view)).to.equal('peter');
    });

    it('can get an attribute value from new state', () => {
      const microcastleState = I.fromJS({
        data: {
          news: {
            one: {
              title: 'hello',
              content: 'world',
            },
          },
        },
        editor: {
          newState: [
            {id: 99, data: {title: 'hi', content: 'hi'}}
          ]
        }
      });

      const view = I.fromJS({
        type: 'news',
        state: 'new',
        entry: 99,
        attribute: 'title'
      });

      expect(getViewValue(microcastleState, view)).to.equal('hi');
    });

    it('can get a part of an attribute', () => {
      const microcastleState = I.fromJS({
        editor: {
          newState: [
            {id: 99, data: {title: 'hi', content: 'hi', array: [{val: 11}, {val: 12}]}}
          ]
        }
      });

      const view = I.fromJS({
        type: 'news',
        state: 'new',
        entry: 99,
        attribute: 'array',
        part: [1, 'val']
      });

      const newState = getViewValue(microcastleState, view);
      expect(newState).to.equal(12);
    });

    it('can get a part of flex in an array part', () => {
      const microcastleState = I.fromJS({
        data: {
          news: {
            one: {
              content: [{text: 'world'}, {text: 'world'}],
            },
          },
        },
      });

      const view = I.fromJS({
        type: 'news',
        state: 'change',
        entry: 'one',
        attribute: 'content',
        part: [1, 'text'],
      });

      expect(getViewValue(microcastleState, view)).to.equal('world');
    });
  });

  describe('changeViewValue', () => {
    it('can set an attribute value from change state', () => {
      const microcastleState = I.fromJS({
        data: {
          news: {
            one: {
              title: 'hello',
              content: 'world',
            },
          },
        },
        editor: {
        }
      });

      const view = I.fromJS({
        type: 'news',
        state: 'change',
        entry: 'one',
        attribute: 'title'
      });

      const newState = changeViewValue(microcastleState, view, 'woo');
      expect(getViewValue(newState, view)).to.equal('woo');
    });

    it('can set an attribute value from new state', () => {
      const microcastleState = I.fromJS({
        data: {
          news: {
            one: {
              title: 'hello',
              content: 'world',
            },
          },
        },
        editor: {
          newState: [
            {id: 99, data: {title: 'hi', content: 'hi'}}
          ]
        }
      });

      const view = I.fromJS({
        type: 'news',
        state: 'new',
        entry: 99,
        attribute: 'title'
      });

      const newState = changeViewValue(microcastleState, view, 'woo');
      expect(getViewValue(newState, view)).to.equal('woo');
    });

    it('can set an array item from change state in new tempState', () => {
      const microcastleState = I.fromJS({
        data: {
          news: {
            one: {
              tags: ['hello', 'world'],
            },
          },
        },
        editor: {
          tempState: {}
        }
      });

      const view = I.fromJS({
        type: 'news',
        state: 'change',
        entry: 'one',
        attribute: 'tags',
        part: [0]
      });

      const newState = changeViewValue(microcastleState, view, 'new');
      expect(getViewValue(newState, view)).to.equal('new');
    });
  });


  describe('getSchemaFromView', () => {
    it('can get a part of flex in an array part', () => {
      const schema = {
        news: {
          attributes: {
            content: {type: 'array', subtype: {type: 'flex', flexes: {
              someText: {
                text: {type: 'text'},
              }
            }}}
          }
        }
      }

      const microcastle = I.fromJS({
        data: {
          news: {
            one: {
              content: [{_flex_type: 'someText', text: 'text'},
                        {_flex_type: 'someText', text: 'text'}]
            }
          }
        }
      });
     
      const view = I.fromJS({
        type: 'news',
        state: 'change',
        entry: 'one',
        attribute: 'content',
        part: [1, 'text'],
      });

      expect(getSchemaFromView(schema, microcastle, view)).to.deep.equal({type: 'text'});
    });
  })
});


