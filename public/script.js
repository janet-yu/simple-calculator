// Make connection
const socket = io.connect(location.origin);

// DOM
const equalBtn = document.getElementById("equal-sign");
const calcInput = document.getElementById("calc-input");
const calcsContainter = document.getElementById("calcs-container");
const calcsList = document.getElementById("calcs-list");
const operatorBtns = document.querySelectorAll(".calculator__operator");
const calcBtns = document.querySelectorAll(".calculator__btn");
const clearBtn = document.getElementById("calc-clear");

// Keep track of calc
let expression = ""; // the end value to evaluate
let input = ""; // the current input in the calculator

const evalParse = function (expr) {
  return Function('"use strict"; return (' + expr + ")")();
};

const clearActive = function () {
  for (let i = 0; i < operatorBtns.length; i++) {
    if (operatorBtns[i].classList.contains("active")) {
      operatorBtns[i].classList.remove("active");
    }
  }
};

const resetState = function () {
  clearActive();
  expression = "";
  input = "";
};

// Emit events
socket.emit("connected");

// equalBtn.addEventListener("click", function () {
//   try {
//     expression += `(${input})`;
//     const result = evalParse(expression);

//     calcInput.innerText = result;
//     socket.emit("calculation", {
//       calculation: expression.replace(/\*/g, "x") + " = " + result,
//     });
//   } catch (e) {
//     calcInput.innerText = "ERR";
//   }
//   resetState();
// });

const evaluateExpr = (expr) => {
  try {
    const result = evalParse(expr);

    calcInput.innerText = result;
    socket.emit("calculation", {
      calculation: expr.replace(/\*/g, "x") + " = " + result,
    });
  } catch (e) {
    calcInput.innerText = "ERR";
  }
  resetState();
};

// event listeners
for (let i = 0; i < calcBtns.length; i++) {
  calcBtns[i].addEventListener("click", function () {
    if (!calcBtns[i].classList.contains("calculator__operator")) {
      // If the button is not an operator (-, +, *, /, or =)
      switch (calcBtns[i].value) {
        case "+/-":
          input = (-parseInt(input)).toString();
          break;
        case "%":
          input = (parseInt(input) / 100).toString();
          break;
        default:
          input += calcBtns[i].value;
      }
      calcInput.innerText = input;
    } else {
      // If the button is an operator
      if (calcBtns[i].value === "=") {
        evaluateExpr(`${expression}(${input})`);
      } else {
        clearActive();
        calcBtns[i].classList.add("active");
        expression += `(${input})${calcBtns[i].value}`;
        input = "";
      }
    }
  });
}

clearBtn.addEventListener("click", function () {
  resetState();
  calcInput.innerText = "0";
});

// Listen for events
socket.on("calculation", (data) => {
  const li = document.createElement("li");
  const node = document.createTextNode(data.calculation);

  li.appendChild(node);
  calcsList.insertBefore(li, calcsList.firstChild);

  if (calcsList.children.length > 10) {
    calcsList.removeChild(calcsList.lastChild);
  }
});

socket.on("connected", (data) => {
  console.log(data);
  let list = "";
  data.forEach((el) => {
    list += "<li>" + el.calculation + "</li>";
  });
  calcsList.innerHTML = list;
});
