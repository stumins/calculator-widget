import React from "react";
import ReactDOM from "react-dom";
import {hot} from "react-hot-loader";

class CalculatorWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
        };
    }

    render() {
        return(
            <div>Hello World and {this.state.name}!</div>
        );
    }
}

export default hot(module)(CalculatorWidget);