import React from 'react';
import { connect } from 'react-redux';

function connectMicrocastle(Original, schemaNames) {
  const MicrocastleConnector = class extends React.Component {
    render(){
      return (
        <Original {...this.props} />
      );
    }
  }

  const connectReducers = connect((state) => {
    let ret = {
      microcastle: {
        schemas: {},
        get: function(schemaName, entryID, attributeName) {
          return this.schemas[schemaName].get(entryID).get(attributeName);
        },
        getEntries: function(schemaName) {
          return this.schemas[schemaName];
        },
      }
    };

    for (let schemaName of schemaNames) {
      ret.microcastle.schemas[schemaName] = state.microcastle.get(schemaName);
    }

    return ret;
  });

  return connectReducers(MicrocastleConnector);
}

export default connectMicrocastle;
