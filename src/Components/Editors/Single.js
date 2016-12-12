import React from 'react';
import _ from 'lodash';
 
import Store from '../../Store/Store';
import { getSchemaFromView } from '../../Store/View';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';

const checkForErrors = (results) => {
      const flatResults = _.flattenDeep([results]);
      let error = null;
      _.forEach(flatResults, (result) => {
        if (_.has(result, 'error')) error = result.error;
      });
      return error != null;
};

class SingleEditor extends React.Component {
  onSubmit() {
    this.props.dispatch(Store.actions.save(this.props.schema));
  }

  render() {
    const schema = getSchemaFromView(this.props.schema, this.props.view);
    const EditorComponent = DataTypes.stringToComponent(schema.type);

    return (
      <ItemFrame title={schema.name}>
        <EditorComponent view={this.props.view}
                         schema={this.props.schema}
                         />
      </ItemFrame>
    );
  }
}


export default SingleEditor;
