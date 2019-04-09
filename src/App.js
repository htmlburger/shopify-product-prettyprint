import React, {Component} from 'react';
import Install from './Install';
import ProductPreview from './ProductPreview';

class App extends Component {
  state = {
    "status": 'loading',
    product: null,
  };
  componentDidMount() {
    fetch('/get-product')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'Unauthorized') {
          this.setState({status: "not-installed"});
        } else {
          this.setState({
            "status": 'installed',
            product: data.product,
          });
        }
      });
  }
  render() {
    return (
      <div>
        {this.state.status === 'loading' && "Loading ... Please wait" }
        {this.state.status === 'not-installed' && <Install />}
        {this.state.statud === 'installed' && <ProductPreview product={this.state.product} />}
      </div>
    );
  }
}

export default App;
