import React from "react";
import ReactDOM from "react-dom";
import {hot} from "react-hot-loader";
import "./CalculatorWidget.css";

const Display = (props) => {
    return(
        <div id={props.id} className="displays">{props.value}</div>
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
            input: "",
            lastInput: "",
            stack: [],
        };
        this.renderButton = this.renderButton.bind(this);
        this.allClear = this.allClear.bind(this);
        this.pressDecimal = this.pressDecimal.bind(this);
        this.pressNumber = this.pressNumber.bind(this);
        this.pressOperator = this.pressOperator.bind(this);
        this.calcOutput = this.calcOutput.bind(this);
        
        this.operators = [
                "+",
                "-",
                "*",
                "/"
        ]
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
            lastInput: "",
        });
    }
    pressDecimal() {
        this.setState((state, props) => {
            // Allow exactly 1 decimal
            // TODO - 2 decimal numbers?
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
        this.setState((state, props) => {
            // Overwrite zeros and empty operators
            if (state.input == "0" || this.operators.includes(state.input)) {
                return { input: num }
            } else {
                return { input: state.input.concat(num) }
            }
        });
    }
    pressOperator(operator) {
        this.setState((state, props) => {
            // Don't allow stacking of operators
            if (this.operators.includes(state.input.slice(-1))) {
                let replacedOperator = state.input.slice(0, -1).concat(operator);
                return { input: replacedOperator }
            } 
            // On operator press after calculation, start new calc with prev output
            else if (state.input.length == 0 && state.output.length !== 0) {
                return { input: state.output.concat(operator) }
            }
            else {
                return { input: state.input.concat(operator) }
            }
        });
    }
    // TODO: MATH!
    calcOutput() {
        this.setState((state, props) => {
            let lastInput = state.input;
            let output = "TODO";
            // Ignore empty inputs
            if (lastInput.length == 0) {
                return { input: "" }
            } 
            // Don't allow trailing decimals
            else if (lastInput.slice(-1) == ".") {
                lastInput = lastInput.concat("0");
            }
            return {
                lastInput: lastInput,
                output: output,
                input: ""
            }
        });
    }
    render() {
        // Default to nobreak space if no last input
        let output = this.state.lastInput.length == 0 ? "" : this.state.lastInput.concat(" = ", this.state.output);
        let display = this.state.input.length == 0 ? this.state.output : this.state.input;
        return(
            <div id="calculator-frame">
                <div id="display-frame">
                    <Display id="output" value={output} />
                    <Display id="display" value={display} />
                </div>
                <div id="button-grid">
                    {this.renderButton("clear","AC", "", this.allClear)}
                    {this.renderButton("divide","/", "operator", () => {this.pressOperator("/")})}
                    {this.renderButton("multiply","*", "operator", () => {this.pressOperator("*")})}  
                    {this.renderButton("seven", "7", "", () => {this.pressNumber("7")})}
                    {this.renderButton("eight", "8", "", () => {this.pressNumber("8")})}
                    {this.renderButton("nine", "9", "", () => {this.pressNumber("9")})}
                    {this.renderButton("subtract","-", "operator", () => {this.pressOperator("-")})}  
                    {this.renderButton("four", "4", "", () => {this.pressNumber("4")})}
                    {this.renderButton("five", "5", "", () => {this.pressNumber("5")})}
                    {this.renderButton("six", "6", "", () => {this.pressNumber("6")})}
                    {this.renderButton("add","+", "operator", () => {this.pressOperator("+")})}
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