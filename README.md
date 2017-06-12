# Microcastle

Backend agnostic data store and editor for react and redux

# Building

`npm install`

`npm run-script build`

# Guide

## Before You Start

Microcastle uses react for rendering, redux for it's data flow, and immutable.js for perfomance reasons. Before you get started with microcastle you should have a good understanding of them and also how a unidirectional data flow works.

## How Does Microcastle Work

Microcastle comes in two main parts: a data store and an editor that edits data in that store.

The store is a simple database like object with a layout similar to other common databases: schemas (analogous to tables) which contain entries (analogous to rows) which then contain attributes (analogous to columns). You are responsible for providing microcastle with schemas for your data, the initial state of your data and then rendering the data on your site.

The editor is overlaid the page and supports many data types (text, arrays, images, etc). you are responsible for providing hooks for the user to open the editor.

## Setting Up Microcastle

to set up microcastle in your project

`npm install microcastle --save`

import it in your project

`import Microcastle from 'microcastle';`

connect the editor and the database to your reducers

```
const reducer = combineReducers({
  microcastle: Microcastle.MicrocastleStore.reducer,
});
```

setup an initial state for both in your redux store

```
const store = createStore(reducer, {
  microcastle: I.fromJS({
    data: { // Put defualt data here
      text: { // Schema
        default: { // Entry
          title: 'Hello World', // Attribute with value
        }
      },
    },
    editor: {},
  }),
}, compose(  
  applyMiddleware(thunk)
));
```

define the schemas you are going to use

```
const mySchemas = {
  People: {
    attributes: {
      job: {
        type: 'text',
      },
      lastName: {
        type: 'text',
      },
    },
    onNew: handleNewFn,
    onEdit: handleEditFn,
  },
};
```

then include the editor component somewhere at the top of your react app but below your redux provider

```
<Provider store={store}>
  <div>
    <Microcastle.MicrocastleEditor schemas={schemas} />
    <SomeComponents />
  </div>
</Provider>
```

now you need to actually use it in your site

## Using It On Your Site

Connect your component to the microcastle schemas it needs

```
class UnconnectedComponent extends Component {
  render() {
    const title = this.props.mcGetAttribute('People', 'default', 'title');
    return <div>
      {title}
      <Microcastle.Button.Create
        text="Create A Text"
        visible={true}
        schema='title'
      />

    </div>;
  }
}

const connectedComponent = Microcastle.MicrocastleConnect(["People"])(UnconnectedComponent);
```

your component will then have a prop called microcastle (the dispatch method too) that can be used to get data

`const bobsJon = this.props.mcGetAttribute('People', 'Bob', 'job');`

and to open the editor use a button

```
<Microcastle.Button.EditAttribute
  text="Create A Text"
  visible={true}
  schema='title'
  entry='default'
  attribute='title'
/>
```

it's as simple as that 🌚


# API

## Connector

### Connector Function

`Microcastle.MicrocastleConnect(arrayOfSchemasToConnect)(component)`

### Connected Props

`props.microcastle.mcGetAttribute(schemaName, entryID, attributeName)`

Gets the value of attribute

`props.microcastle.mcGetEntry(schemaName, entryID)`

Gets the whole entry

`props.microcastle.mcGetSchema(schemaName)`

Returns immutable js map of {entryName: {attributeName: attributeValue}}

Get all entries in a schema.

## Editor Component

`<Microcastle.MicrocastleEditor schemas={schemas} />`

## Schema

The Schema needs to be in the layout of:

```
{
  SCHEMA_NAME: {
    attributes: {
      ATTRIBUTE_NAME: {
        type: 'TYPE_NAME',
        option?: ???,
      },
      OTHER_ATTRIBUTE_NAME: { ... },
    },
    onNew: SOME_FUNCTION,
    onEdit: SOME_FUNCTION,
  },
  OTHER_SCHEMA_NAME: { ... },
}
```

### OnNew Function

takes: createdEntryValues

must return: Promise that resolves to an object of {EntryID: Entry}

You must specify this function, in it you should sync with your server or edit the entry however you want. Example:

```
onNew: (v) => new Promise((resolve, reject) => {
  let rand = Math.random().toString(36).substring(7);
  resolve({[rand]: v});
})
```

### OnEdit Function

takes: editedEntryValues, info: {id}

must return: Promise that resolves to an Entry

You must specify this function, in it you should sync with your server or edit the entry however you want. Example:

```
onNew: (val, {id}) => new Promise((resolve, reject) => {
  resolve(val);
})
```

## Types

### Text

Simple Text field

Options: None

### Image

Image

Options: None

### Array

Array of another type

Options: subtype

### Relation

Lets user pick a field from another Schema

Options: relative

### Select

Dropdown field

Options: choices (array)

### Flex

### Group

### Markdown
