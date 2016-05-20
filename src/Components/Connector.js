import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Store from '../Store/Store';

const connectMC = schemaNames => Original => {
  const MicrocastleConnector = class extends React.Component {
    render() {
      return <Original {...this.props} />
    }
  };
  
  const connectStore = state => {
    let ret = {
      mcSchemas: {},
      mcGetSchema: function(schemaName) {
        return this.mcSchemas[schemaName];
      },
      mcGetEntry: function(schemaName, entryID) {
        const schema = this.mcGetSchema(schemaName);
        if (schema == null) return undefined;
        return schema.get(entryID, undefined);
      },
      mcGetAttribute: function(schemaName, entryID, attributeName) {
        const entry = this.mcGetEntry(schemaName, entryID);
        if (entry == null) return undefined;
        return entry.get(attributeName, undefined);
      },
    }
    
    for (const schemaName of schemaNames) {
      ret.mcSchemas[schemaName] = state.microcastle.get('data').get(schemaName);
    }
    
    return ret;
  };
  
  const connectDispatch = dispatch => ({
    mcCreate: bindActionCreators(Store.actions.createNew, dispatch),
    mcEditEntry: bindActionCreators(Store.actions.editEntry, dispatch),
    mcEditAttribute: bindActionCreators(Store.actions.editSingle, dispatch),
  });
  
  return connect(connectStore, connectDispatch)(MicrocastleConnector);
} 
  
export default connectMC;
