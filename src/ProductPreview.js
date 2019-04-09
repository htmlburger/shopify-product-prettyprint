import React, {Component} from 'react';

class ProductPreview extends Component {
  render() {
    return (
      <pre>
        { this.props && JSON.stringify(this.props.product, null, 2) }
      </pre>
    );
  }
}

export default ProductPreview;
