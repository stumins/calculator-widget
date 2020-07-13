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
            stack: [],
            lastOperator: ""
        };
        this.renderButton = this.renderButton.bind(this);
        this.allClear = this.allClear.bind(this);
        this.pressDecimal = this.pressDecimal.bind(this);
        this.pressNumber = this.pressNumber.bind(this);
        this.calcOutput = this.calcOutput.bind(this);
    }
    renderButton(id, value, classes, handleClick) {
        return(
            <Button 
                id={id}
                value={value}
                classes={classes}
                onClick={handleClick}
            />
        );
    }
    allClear() {
        this.setState({
            output: 0,
            input: "",
        });
    }
    pressDecimal() {
        this.setState((state, props) => {
            if (state.input.includes(".")) {
                return { input: state.input }
            } else if (state.input.length == 0) {
                // Add leading zero on empty input
                return { input: state.input.concat("0.") }
            } else {
                return { input: state.input.concat(".") }
            }
        });
    }
    pressNumber(num) {
        // Only allow a single zero
        this.setState((state, props) => {
            if (state.input == "0") {
                return { input: num }
            } else {
                return { input: state.input.concat(num) }
            }
        });
    }
    /* TODO evaluate math */
    calcOutput() {
        // Ignore empty inputs
        if (this.state.input.length == 0) {
            return
        } else {
            this.setState((state, props) => {
                // Ignore empty inputs
                if (state.input.length == 0) {
                    return { input: "" }
                } else {
                    return {
                        output: state.input,
                        input: ""
                    }
                }
            });
        }
    }
    render() {
        let display = this.state.input.length == 0 ? this.state.output : this.state.input;
        return(
            <div id="calculator-frame">
                <div id="display-frame">
                    <Display value={display} />
                </div>
                <div id="button-grid">
                    {this.renderButton("clear","AC", "", this.allClear)}
                    {this.renderButton("divide","/", "operator", )}
                    {this.renderButton("multiply","*", "operator", )}  
                    {this.renderButton("seven", "7", "", () => {this.pressNumber("7")})}
                    {this.renderButton("eight", "8", "", () => {this.pressNumber("8")})}
                    {this.renderButton("nine", "9", "", () => {this.pressNumber("9")})}
                    {this.renderButton("subtract","-", "operator", )}  
                    {this.renderButton("four", "4", "", () => {this.pressNumber("4")})}
                    {this.renderButton("five", "5", "", () => {this.pressNumber("5")})}
                    {this.renderButton("six", "6", "", () => {this.pressNumber("6")})}
                    {this.renderButton("add","+", "operator", )}
                    {this.renderButton("one", "1", "", () => {this.pressNumber("1")})}
                    {this.renderButton("two", "2", "", () => {this.pressNumber("2")})}
                    {this.renderButton("three", "3", "", () => {this.pressNumber("3")})}
                    {this.renderButton("equals", "=", "", this.calcOutput)}
                    {this.renderButton("zero", "0", "", () => {this.pressNumber("0")})}
                    {this.renderButton("decimal", ".", "", this.pressDecimal)}
                </div>
            </div>
        );
    }
}

export default hot(module)(CalculatorWidget);