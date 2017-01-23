import React from 'react';

import Store from '../../Store/Store';
import { getSchemaFromView } from '../../Store/View';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';

class PartEditor extends React.Component {
  onSubmit() {
    this.props.dispatch(Store.actions.save(this.props.schema));
    this.props.dispatch(Store.actions.close());
  }

  render() {
    const schema = getSchemaFromView(this.props.schema, this.props.microcastle, this.props.view);
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
