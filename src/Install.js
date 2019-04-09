import React, {Component} from 'react';

class Install extends Component {
  constructor(props) {
    super(props);
    this.domainInputRef = React.createRef();
  }
  componentDidMount() {
    // Add focus in the beginning of the field
    this.domainInputRef.current.focus();
    this.domainInputRef.current.selectionStart = 0;
    this.domainInputRef.current.selectionEnd = 0;
  }
  render() {
    return (
      <div>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/light.css"
        />
        <form action="/install">
          <h1>Install the app to your Shopify Store</h1>
          <label>Domain Name:</label>
          <input
            type="text"
            name="shop"
            defaultValue=".myshopify.com"
            ref={this.domainInputRef}
          />
          <input type="submit" value="Install" />
        </form>
      </div>
    );
  }
}

export default Install;
