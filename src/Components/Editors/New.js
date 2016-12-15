import React from 'react';
import _ from 'lodash';
import { getSchemaFromView } from '../../Store/View';

import Store from '../../Store/Store';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';


class NewEditor extends React.Component {
  onSubmit() {
    this.props.dispatch(Store.actions.save(this.props.schema));
  }

  render() {
    const schema = getSchemaFromView(this.props.schema, this.props.view);

    const editorComponents = _.values(_.mapValues(schema.attributes, (columnOptions, columnName) => {
      const ColumnComponent = DataTypes.stringToComponent(columnOptions.type);
      return (
        <ItemFrame title={columnOptions.name || columnName} key={columnName}>
          <ColumnComponent view={this.props.view.set('attribute', columnName)} 
                           schema={this.props.schema} />
        </ItemFrame>
      );
    }));

    return <div>
        {editorComponents}
    </div>; 
  }
}

export default NewEditor;
