import React from "react";
import ReactDOM from "react-dom";
import {hot} from "react-hot-loader";
import "./CalculatorWidget.css";

const Display = (props) => {
    return(
        <div id="display">{props.value}</div>
    );
}

const Button = (props) => {
    let classes = "btn".concat(" ", props.classes);
    return(
        <div id={props.id} className={classes} onClick={props.onClick}>{props.value}</div>
    );
}

class CalculatorWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            output: 0,
            input: [],
        };
        this.allClear = this.allClear.bind(this);
    }
    allClear() {
        this.setState({
            output: 0,
            input: [],
        });
    }

    render() {
        return(
            <div id="calculator-frame">
                <div id="display-frame">
                    <Display value={this.state.output} />
                </div>
                <div id="button-grid">
                    <Button id="clear" value="AC" classes="" onClick={this.allClear} />
                    <Button id="inverse" value="+/-" classes="operator" onClick={() => {}} />
                    <Button id="divide" value="/" classes="operator" onClick={() => {}} />
                    <Button id="seven" value="7" onClick={() => {}} />
                    <Button id="eight" value="8" onClick={() => {}} />
                    <Button id="nine" value="9" onClick={() => {}} />
                    <Button id="multiply" value="*" classes="operator" onClick={() => {}} />
                    <Button id="four" value="4" onClick={() => {}} />
                    <Button id="five" value="5" onClick={() => {}} />
                    <Button id="six" value="6" onClick={() => {}} />
                    <Button id="subtract" value="-" classes="operator" onClick={() => {}} />
                    <Button id="one" value="1" onClick={() => {}} />
                    <Button id="two" value="2" onClick={() => {}} />
                    <Button id="three" value="3" onClick={() => {}} />
                    <Button id="add" value="+" classes="operator" onClick={() => {}} />
                    <Button id="zero" value="0" onClick={() => {}} />
                    <Button id="decimal" value="." onClick={() => {}} />
                    <Button id="equals" value="=" onClick={() => {}} />
                </div>
            </div>
        );
    }
}

export default hot(module)(CalculatorWidget);