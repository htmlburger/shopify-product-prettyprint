import React, {Component} from 'react';

class ProductPreview extends Component {
  render() {
    return (
      <pre>
        { this.props.product && JSON.stringify(this.props.product) }
      </pre>
    );
  }
}

export default ProductPreview;
