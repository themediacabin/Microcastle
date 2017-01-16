import Microcastle from "../../index.js";

import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import I from "immutable";
import thunk from "redux-thunk";

import FlexEditor from "./Flex";

describe("Datatype Flex", () => {
  describe("Should Integrate", () => {

    const reducer = combineReducers({
      microcastle: Microcastle.MicrocastleStore.reducer
    });

    const schema = {
      person: {
        onEdit: sinon.spy(v => Promise.resolve(v)),
        attributes: {
          quote: {
            type: "flex",
            flexes: {
              anonymous: {
                quote: {type: 'text'}
              }, 
              known: {
                quote: { type: 'text' },
                author: { type: 'text' }
              }, 
            },
          }
        }
      }
    };

    it("Can Edit Array", async () => {
      const store = createStore(
        reducer,
        {
          microcastle: I.fromJS({
            data: { person: { "bob": { quote: {_flex_type: 'known', quote: 'hello', author: 'world'} } } },
            editor: {}
          })
        },
        applyMiddleware(thunk)
      );

      const rendered = mount(
        <Provider store={store}>
          <div>
            <Microcastle.MicrocastleEditor schemas={schema} />
            <Microcastle.Button.EditEntry visible={true} schema="person" entry={
              "bob"
            } />
          </div>
        </Provider>
      );

      rendered.find(Microcastle.Button.EditEntry).simulate("click");
      rendered
        .find("textarea")
        .at(0)
        .simulate("change", { target: { value: "howdy" } });
      rendered.find(".microcastle-editor-save").at(0).simulate("click");
      await new Promise(r => setImmediate(r));

      await expect(
        store.getState().microcastle.getIn([
          "data",
          "person",
          "bob",
          "quote"
        ])
      ).to.equal(new I.Map({_flex_type: 'known', quote: 'howdy', author: 'world'}));
    });
  });

  describe("#defaultValue", () => {
    it("should return empty map", () => {
      expect(FlexEditor.defaultValue()).to.deep.equal(I.fromJS({_flex_type: undefined}));
    });
  });

  describe("#validate", () => {
    it("should return empty array on pass", () => {
      expect(FlexEditor.validate({}, [])).to.deep.equal([]);
    });

    it("should return array of required if required is set & no value", () => {
      expect(
        FlexEditor.validate({ required: true }, I.fromJS({_flex_type: undefined}))
      ).to.deep.equal([ "required" ]);
    });
  });
});

