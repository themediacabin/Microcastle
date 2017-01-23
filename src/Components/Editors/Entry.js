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

class EntryEditor extends React.Component {
  onSubmit() {
    this.props.dispatch(Store.actions.save(this.props.schema));
    this.props.dispatch(Store.actions.close());
  }

  render() {
    const schema = getSchemaFromView(this.props.schema, this.props.microcastle, this.props.view);

    const editorComponents = _.values(_.mapValues(schema.attributes, (columnOptions, columnName) => {
      const ColumnComponent = DataTypes.stringToComponent(columnOptions.type);
      return (
        <ItemFrame title={columnOptions.name || columnName} key={columnName}>
          <ColumnComponent view={this.props.view.set('attribute', columnName)} 
                           schema={this.props.schema} />
        </ItemFrame>
      );
    }));

    return (<div style={style.base}>
        {editorComponents}</div>
    );
  }
}

export default EntryEditor;
