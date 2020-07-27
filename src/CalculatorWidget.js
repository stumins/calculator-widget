import React from "react";
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
            display: "",
            lastInput: "",
            lastOutput: "",
            inputQueue: "",
            outputQueue: [],
            operatorStack: [],
        };
        this.renderButton = this.renderButton.bind(this);
        this.pressButton = this.pressButton.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.calcOutput = this.calcOutput.bind(this);
        this.allClear = this.allClear.bind(this);
        this._isOperator = this._isOperator.bind(this);
        // Define operators
        this.operators = {
            "*": {
                "precedence": 3,
                "associativity": "left",
                "action": (a, b) => a * b,
            },
            "/": {
                "precedence": 3,
                "associativity": "left",
                "action": (a, b) => a / b,
            },
            "+": {
                "precedence": 2,
                "associativity": "left",
                "action": (a, b) => a + b,
            },
            "-": {
                "precedence": 2,
                "associativity": "left",
                "action": (a, b) => a - b,
            },
        }
    }
    _isOperator(symbol) {
        return Object.keys(this.operators).includes(symbol)
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
    pressButton(symbol) {
        // If the input contains a decimal, ignore decimal presses
        if (symbol == "." && this.state.inputQueue.includes(".")) {
            return
        } 
        // If the input is an operator and there is no prior input, add the last output
        else if (this._isOperator(symbol) && this.lastOutput != "") {
            this.handleInput(this.lastOutput);
            this.handleInput(symbol);
        } else {
            this.handleInput(symbol);
        }
    }
    handleInput(symbol) {
        // Dijkstra's shunting-yard algorithm: https://en.m.wikipedia.org/wiki/Shunting-yard_algorithm
        if (/\d/g.test(symbol) || symbol == ".") {
            // symbol is a digit or a decimal, add it to input queue 
            this.setState((state, props) => {
                return {
                    inputQueue: state.inputQueue.concat(symbol),
                    display: state.display.concat(symbol)
                }
            });
        } 
        else if (this._isOperator(symbol)) {
            // symbol is an operator
            let newQueue = this.state.outputQueue;
            if (this.state.inputQueue.length > 0) {
                // If a numeric input exists, push it to output queue before operator stack ops
                newQueue.push(this.state.inputQueue);
            }
            // While top of stack contains higher rank operator or equal rank & left associativity
            let stack = this.state.operatorStack.slice();
            let sym_md, top_md;
            while (stack.length > 0) {
                sym_md = this.operators[symbol] // Get operator metadata from symbol
                top_md = this.operators[stack[0]] // Get operator metadata of top of stack
                if (top_md.precedence > sym_md.precedence || 
                    (top_md.precedence == sym_md.precedence && sym_md.associativity == "left")) {
                    // pop off top of stack and move to output queue
                    newQueue.push(stack.shift());
                } else {
                    // No more operators have precedence
                    break;
                }
            }
            // Add operator to top of stack
            stack.unshift(symbol);
            this.setState((state, props) => {
                return {
                    inputQueue: "",
                    operatorStack: stack,
                    outputQueue: newQueue,
                    display: state.display.concat(symbol)
                }
            });
        } else {
            // TODO: Add support for parens & functions
            return
        }
    }
    calcOutput() {
        // Final part of shunting-yard : move remaining input & operators into output queue to form RPN notation
        // https://en.m.wikipedia.org/wiki/Reverse_Polish_notation
        let RPN = this.state.outputQueue.concat(this.state.inputQueue).concat(this.state.operatorStack)
        console.log("RPN: ", RPN);
        // Solve RPN for an output
        let stack = [];
        for (let idx in RPN) {
            let symbol = RPN[idx];
            if (!this._isOperator(symbol)) {
                // Convert to float and add to stack
                stack.unshift(Number.parseFloat(symbol));
            } else {
                // Pop numbers off stack, exec operator action, add to stack
                let arg2 = stack.shift();
                let arg1 = stack.shift()
                let operatorAction = this.operators[symbol].action
                let val = operatorAction(arg1, arg2);
                stack.unshift(operatorAction(arg1, arg2));
            }
        }
        // Answer should be at the top of the stack
        let output = stack.shift();
        this.setState((state, props) => {
            // update history, reset the display & stacks
            return {
                lastInput: state.display,
                lastOutput: output,
                display: "",
                inputQueue: "",
                outputQueue: [],
                operatorStack: [],
            }
        });
    }
    allClear() {
        this.setState({
            display: "",
            lastInput: "",
            lastOutput: "",
            inputQueue: "",
            outputQueue: [],
            operatorStack: [],
        });
    }
    render() {
        // Default to nobreak space if no last infixInput
        let output = this.state.lastInput.length == 0 ? "" : `${this.state.lastInput} = ${this.state.lastOutput}`
        // Show users a zero if the input display is empty
        let userDisplay = this.state.display.length == 0 ? "0" : this.state.display;
        return(
            <div id="calculator-frame">
                <div id="display-frame">
                    <Display id="output" value={output} />
                    <Display id="display" value={userDisplay} />
                </div>
                <div id="button-grid">
                    {this.renderButton("clear","AC", "", this.allClear)}
                    {this.renderButton("divide","/", "operator", () => {this.pressButton("/")})}
                    {this.renderButton("multiply","*", "operator", () => {this.pressButton("*")})}  
                    {this.renderButton("seven", "7", "", () => {this.pressButton("7")})}
                    {this.renderButton("eight", "8", "", () => {this.pressButton("8")})}
                    {this.renderButton("nine", "9", "", () => {this.pressButton("9")})}
                    {this.renderButton("subtract","-", "operator", () => {this.pressButton("-")})}  
                    {this.renderButton("four", "4", "", () => {this.pressButton("4")})}
                    {this.renderButton("five", "5", "", () => {this.pressButton("5")})}
                    {this.renderButton("six", "6", "", () => {this.pressButton("6")})}
                    {this.renderButton("add","+", "operator", () => {this.pressButton("+")})}
                    {this.renderButton("one", "1", "", () => {this.pressButton("1")})}
                    {this.renderButton("two", "2", "", () => {this.pressButton("2")})}
                    {this.renderButton("three", "3", "", () => {this.pressButton("3")})}
                    {this.renderButton("equals", "=", "", this.calcOutput)}
                    {this.renderButton("zero", "0", "", () => {this.pressButton("0")})}
                    {this.renderButton("decimal", ".", "", () => {this.pressButton(".")})}
                </div>
            </div>
        );
    }
}

export default hot(module)(CalculatorWidget);