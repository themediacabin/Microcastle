# Microcastle

Backend agnostic data store and editor for react and redux

# Building

`npm install`

`gulp`

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
  microcastle: Microcastle.MicrocastleDataStore.reducer,
  microcastleEditor: Microcastle.MicrocastleEditorStore.reducer,
});
```

setup an initial state for both in your redux store

```
const initalState = {
  microcastleEditor: new Immutable.Map({}),
  microcastle: Immutable.fromJS({
    People: {
      Bob: {
        job: 'Middle Manager',
        lastName: 'Bobson',
      },
    },
  }),
};

const store = createStore(reducer, initialState);
```

define the schemas you are going to use

```
const mySchemas = {
  People: {
    attributes: {
      job: {
        type: 'text',
        onChange: handleJobChangeFn,
      },
      lastName: {
        type: 'text',
        onChange: handleLastNameChangeFn,
      },
    },
    onNew: handleNewFn,
    onEdit: handleEditFn,
  },
};
```

then include the editor component somewhere at the top of your react app but below your redux provider

`<Microcastle.MicrocastleEditor schemas={mySchemas} />`

now you need to actually use it in your site

## Using It On Your Site

Connect your component to the microcastle schemas it needs

`const connectedComponent = Microcastle.Microcastle(myComponent, ["People"]);`

your component will then have a prop called microcastle (the dispatch method too) that can be used to get data

`const bobsJon = this.props.microcastle.get('People', 'Bob', 'job');`

and to open the editor dispatch an event

```
const openEditorForBobsJob = () => {
  this.props.dispatch(
    Microcastle.MicrocastleEditorStore.actions. editSingle(
      'People', 'Bob', 'job',
      this.props.microcastle.get('People', 'Bob', 'job')
    )
  )
};

return <a onClick={openEditorForBobsJob}>Edit</a>;
```

it's as simple as that 🌚


# API

## Editor Actions

`Microcastle.MicrocastleEditorStore.actions.editSingle(schemaName, entryID, attributeName, currentValue)`

Open the editor and edit a single attribute.

`Microcastle.MicrocastleEditorStore.actions.editEntry(schemaName, entryID, currentValue)`

Open the editor and edit a single an entire entry.

`Microcastle.MicrocastleEditorStore.actions.createNew(schemaName) `

Open the editor and create a new entry.

## Store Actions

`Microcastle.DataStore.actions.updateData(schemaName, entryID, attributeName, value)`

Update a attribute in the datastore

`Microcastle.DataStore.actions.insertData(schemaName, entryID, entryValue) `

Insert a new entry into the datastore

## Connector

### Connector Function

`Microcastle.Microcastle(component, arrayOfSchemasToConnect)`

### Connected Props

`props.microcastle.get(schemaName, entryID, attributeName)`

Gets the value of attribute

`props.microcastle.getEntries(schemaName)`

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
        options?: {
          subtype?: 'TYPE_NAME',
          suboptions?: { ... },
        },
        onChange: SOME_FUNCTION,
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

takes: createdEntry

must return: Promise that resolves to an object of {EntryID: Entry}

You must specify this function, in it you should sync with your server or edit the entry however you want. Example:

```
onNew: (v) => new Promise((resolve, reject) => {
  let rand = Math.random().toString(36).substring(7);
  resolve({[rand]: v});
})
```

### OnEdit Function

takes: editedEntry

must return: Promise that resolves to an Entry

You must specify this function, in it you should sync with your server or edit the entry however you want. Example:

```
onNew: (v) => new Promise((resolve, reject) => {
  resolve(v);
})
```

### onChange Function

takes: changedAttribute

must return: Promise that resolves to the attribute value

You must specify this function, in it you should sync with your server or edit the attribute value however you want. Example:

```
onChange: (v) => new Promise((resolve, reject) => {
  resolve(v);
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