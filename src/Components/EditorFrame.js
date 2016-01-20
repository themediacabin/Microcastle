import React from 'react';

import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

class EditorFrame extends React.Component {
  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onClick={this.props.onCancel} />,
      <FlatButton
        label="Submit"
        primary={true}
        onClick={this.props.onSubmit} />,
    ];

    return (
      <Dialog
          title={this.props.title}
          actions={actions}
          modal={true}
          autoScrollBodyContent={true}
          open={this.props.open || false} >
        {this.props.children}
      </Dialog>
    );
  }
}

export default EditorFrame;
