import React, {Component} from 'react';
import Install from './Install';
import ProductPreview from './ProductPreview';

import {AppProvider, Layout, Page} from '@shopify/polaris';
import '@shopify/polaris/styles.css';

class App extends Component {
  state = {
    status: 'loading',
    product: null,
  };
  componentDidMount() {
    fetch('/get-product')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'Unauthorized') {
          this.setState({status: 'not-installed'});
        } else {
          this.setState({
            status: 'installed',
            product: data.product,
          });
        }
      });
  }
  render() {
    return (
      <AppProvider>
        <Page>
          <Layout>
            <Layout.AnnotatedSection title="Demo App" />
            {this.state.status === 'loading' && 'Loading ... Please wait'}
            {this.state.status === 'not-installed' && <Install />}
            {this.state.status === 'installed' && (
              <ProductPreview product={this.state.product} />
            )}
          </Layout>
        </Page>
      </AppProvider>
    );
  }
}

export default App;
