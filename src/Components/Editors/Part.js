import React from 'react';
import _ from 'lodash';

import Store from '../../Store/Store';
import { getSchemaFromView } from '../../Store/View';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';

const style = {
  base: {
    background: 'white',
    flexDirection: 'column',
  }
};

class PartEditor extends React.Component {
  onSubmit() {
    this.props.dispatch(Store.actions.save(this.props.schema));
    this.props.dispatch(Store.actions.close());
  }

  render() {
    const schema = getSchemaFromView(this.props.schema, this.props.view);
    const EditorComponent = DataTypes.stringToComponent(schema.type);

    return (
      <ItemFrame title={this.props.view.get('attribute')}>
        <EditorComponent view={this.props.view}
                         schema={this.props.schema}
                         />
      </ItemFrame>
    );
  }
}

export default PartEditor;
