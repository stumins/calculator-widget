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
            lastButton: "",
            lastInput: "",
            lastOutput: "",
            invertSign: false,
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
                // If only 1 value is passed, return its inverse; otherwise, subtract b from a
                "action": (a, b) => a == undefined ? -b : b == undefined ? -a : a - b
            },
        }
    }
    _isOperator(symbol) {
        return Object.keys(this.operators).includes(symbol);
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
        console.log("buttonpress: ", symbol);
        console.log("prior state: ", this.state);
        // If the input contains a decimal, ignore decimal presses
        if (symbol == "." && this.state.inputQueue.includes(".")) {
            return
        }
        // If the input is a zero,
        else if (this.state.inputQueue == "0") {
            if (symbol == "0") { return; } // And the symbol is a zero, ignore
            else if (/\d/g.test(symbol)) {
                // And the symbol is a digit, replace the zero with the new digit
                this.setState({
                    lastButton: symbol,
                    inputQueue: symbol,
                    display: this.state.display.slice(0, -1).concat(symbol),
                })
            } else {
                // And the symbol is an operator or decimal, handle input
                this.handleInput(symbol);
            }
        }
        // If the input is an operator
        else if (this._isOperator(symbol)) {
            // Get last 2 chars for display manipulations
            let lastTwoChars = Array.from(this.state.display.slice(-2));
            if (!this._isOperator(this.state.lastButton)) {
                // previous input is non-operator, handle symbol as operator
                this.handleInput(symbol);
            } else if (symbol == "-") {
                // previous input is operator, symbol is - ; set invert flag
                // if last 2 chars are operators, replace the last with -; otherwise, concat symbol
                let newDisplay = lastTwoChars.every(x => this._isOperator(x)) ? 
                    this.state.display.slice(0, -1).concat(symbol) : 
                    this.state.display.concat(symbol);
                this.setState({
                    lastButton: symbol,
                    invertSign: true,
                    display: newDisplay,
                });
            } else {
                // previous input is operator, symbol is not - ; reset stack, reset invert flag, replace prior operator
                let newStack = symbol.concat(this.state.operatorStack.slice(1));
                let numOperators = lastTwoChars.reduce((sum, x) => {
                    if (this._isOperator(x)) {
                        sum += 1;
                    }
                    return sum;
                }, 0);
                let newDisplay;
                console.log(numOperators);
                switch (numOperators) {
                    // if last 2 chars are operators, replace both with symbol;
                    case 2:
                        newDisplay = this.state.display.slice(0, -2).concat(symbol);
                        break;
                    // if only last char is operator, replace last with symbol;    
                    case 1:
                        newDisplay = this.state.display.slice(0, -1).concat(symbol);
                        break;
                    // if no operators, concat symbol
                    default:
                        newDisplay = this.state.display.concat(symbol);
                }
                this.setState({
                    lastButton: symbol,
                    invertSign: false,
                    operatorStack: newStack,
                    display: newDisplay,
                })
            }
        }
        // Standard button press
        else {
            this.handleInput(symbol);
        }
    }
    handleInput(symbol) {
        // Dijkstra's shunting-yard algorithm: https://en.m.wikipedia.org/wiki/Shunting-yard_algorithm
        if (symbol == ".") {
            // symbol is decimal, add it to stack
            this.setState((state, props) => {
                return {
                    lastButton: symbol,
                    inputQueue: state.inputQueue.concat(symbol),
                    display: state.display.concat(symbol),
                }
            });
        }
        else if (/\d/g.test(symbol)) {
            // symbol is a number/digit
            let invert = this.state.invertSign;
            let newSymbol = symbol;
            if (invert) {
                // if invertSign flag is on, invert sign of number & reset flag
                newSymbol = "-".concat(symbol)
                invert = false; 
            }
            this.setState((state, props) => {
                return {
                    lastButton: symbol,
                    inputQueue: state.inputQueue.concat(newSymbol),
                    display: state.display.concat(symbol), // Display is adjusted in pressButton
                    invertSign: invert
                }
            });
        } 
        else if (this._isOperator(symbol)) {
            // symbol is an operator
            let displayQueue = [symbol];
            let newQueue = this.state.outputQueue;
            if (this.state.lastButton == "=") {
                // If an operator is pressed immediately after equals, use the last output as input; handle user display
                if (!Number.isNaN(this.state.lastOutput)) {
                    newQueue.push(this.state.lastOutput.toString());
                    displayQueue.unshift(this.state.lastOutput.toString());
                } else {
                    // If last output was NaN, push a zero instead
                    newQueue.push("0");
                    displayQueue.unshift("0");
                }
            }
            else if (this.state.inputQueue.length > 0) {
                // If an operator is pressed when numeric input exists, push input to output queue first
                newQueue.push(this.state.inputQueue);
            }
            // While top of stack contains higher rank operator or equal rank & left associativity
            let stack = this.state.operatorStack.slice();
            let sym_md, top_md;
            while (stack.length > 0) {
                sym_md = this.operators[symbol] // Get operator metadata from symbol
                top_md = this.operators[stack[0]] // Get operator metadata of top of stack
                if (top_md.precedence > sym_md.precedence || 
                    (top_md.precedence == sym_md.precedence && sym_md.associativity == "left")
                ) { 
                    newQueue.push(stack.shift()); // pop off top of stack and move to output queue
                } 
                else {
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
                    display: state.display.concat(...displayQueue),
                    lastButton: symbol,
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
        let RPN = this.state.outputQueue.concat(this.state.inputQueue).concat(this.state.operatorStack);
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
                console.log(operatorAction, val, arg1, arg2);
                stack.unshift(operatorAction(arg1, arg2));
            }
        }
        // Answer should be at the top of the stack - show NaN/empty/errors as ERR
        let output = stack.shift();
        this.setState((state, props) => {
            // update history, reset the display & stacks
            return {
                lastInput: state.display,
                lastOutput: output,
                display: "",
                lastButton: "=",
                invertSign: false,
                inputQueue: "",
                outputQueue: [],
                operatorStack: [],
            }
        });
    }
    allClear() {
        this.setState({
            display: "",
            lastButton: "",
            lastInput: "",
            lastOutput: "",
            inputQueue: "",
            invertSign: false,
            outputQueue: [],
            operatorStack: [],
        });
    }
    render() {
        let output;
        // Default to nobreak space if no last input
        if (this.state.lastInput.length == 0) { output = ""; } 
        else if (Number.isNaN(this.state.lastOutput)) {
            //Show ERR on syntax errors
            output = `${this.state.lastInput} = ERR`;
        } else {
            output = `${this.state.lastInput} = ${this.state.lastOutput}`;
        }
        // Show users the current input; if empty, show users the last output if there is one, otherwise show a zero
        let userDisplay;
        if (!this.state.display.length == 0) { userDisplay = this.state.display; } 
        else {
            if (this.state.lastOutput == undefined || this.state.lastOutput == "") {
                userDisplay = "0";
            } else if (Number.isNaN(this.state.lastOutput)) { 
                userDisplay = "ERR";
            }
            else {
                userDisplay = this.state.lastOutput;
            }
        }
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