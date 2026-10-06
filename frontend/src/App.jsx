import {
  useEffect,
  useState
} from "react";

import Chatbot from "./Chatbot";

import "./App.css";


const API_URL =
  "http://127.0.0.1:8000";


function App() {

  // ========================================
  // AUTH
  // ========================================

  const [token, setToken] =
    useState(
      localStorage.getItem(
        "token"
      )
    );


  const [authMode, setAuthMode] =
    useState("login");


  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword
  ] = useState(false);


  const [
    authMessage,
    setAuthMessage
  ] = useState("");


  const [
    authError,
    setAuthError
  ] = useState("");


  // ========================================
  // EXPENSES
  // ========================================

  const [
    expenses,
    setExpenses
  ] = useState([]);


  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [
    category,
    setCategory
  ] = useState("Food");


  const [
    expenseDate,
    setExpenseDate
  ] = useState("");


  const [
    editingId,
    setEditingId
  ] = useState(null);


  // ========================================
  // REGISTER
  // ========================================

  async function registerUser(
    event
  ) {

    event.preventDefault();

    setAuthError("");
    setAuthMessage("");


    try {

      const response =
        await fetch(
          `${API_URL}/register`,

          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify(
              {
                name,
                email,
                password
              }
            )
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Registration failed"
        );
      }


      setAuthMessage(
        "Registration successful. Please login."
      );


      setAuthMode("login");

      setName("");

      setPassword("");


    } catch (error) {

      setAuthError(
        error.message
      );
    }
  }


  // ========================================
  // LOGIN
  // ========================================

  async function loginUser(
    event
  ) {

    event.preventDefault();

    setAuthError("");
    setAuthMessage("");


    try {

      const response =
        await fetch(
          `${API_URL}/login`,

          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify(
              {
                email,
                password
              }
            )
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Login failed"
        );
      }


      localStorage.setItem(
        "token",
        data.access_token
      );


      setToken(
        data.access_token
      );


      setEmail("");
      setPassword("");


    } catch (error) {

      setAuthError(
        error.message
      );
    }
  }


  // ========================================
  // LOGOUT
  // ========================================

  function logout() {

    localStorage.removeItem(
      "token"
    );

    setToken(null);

    setExpenses([]);
  }


  // ========================================
  // FETCH EXPENSES
  // ========================================

  async function fetchExpenses() {

    try {

      const response =
        await fetch(
          `${API_URL}/expenses`,

          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      if (
        response.status === 401 ||
        response.status === 403
      ) {

        logout();

        return;
      }


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          "Could not load expenses"
        );
      }


      setExpenses(data);


    } catch (error) {

      console.error(
        "Expense loading error:",
        error
      );
    }
  }


  useEffect(() => {

    if (token) {
      fetchExpenses();
    }

  }, [token]);


  // ========================================
  // ADD / UPDATE EXPENSE
  // ========================================

  async function saveExpense(
    event
  ) {

    event.preventDefault();


    const expenseData = {

      title,

      amount:
        Number(amount),

      category,

      expense_date:
        expenseDate
    };


    const url =
      editingId === null

        ? `${API_URL}/expenses`

        : `${API_URL}/expenses/${editingId}`;


    const method =
      editingId === null

        ? "POST"

        : "PUT";


    const response =
      await fetch(
        url,

        {
          method,

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body:
            JSON.stringify(
              expenseData
            )
        }
      );


    if (
      response.status === 401 ||
      response.status === 403
    ) {

      logout();

      return;
    }


    resetForm();

    fetchExpenses();
  }


  // ========================================
  // EDIT EXPENSE
  // ========================================

  function editExpense(
    expense
  ) {

    setTitle(
      expense.title
    );

    setAmount(
      expense.amount
    );

    setCategory(
      expense.category
    );

    setExpenseDate(
      expense.expense_date
    );

    setEditingId(
      expense.id
    );
  }


  // ========================================
  // DELETE EXPENSE
  // ========================================

  async function deleteExpense(
    id
  ) {

    const response =
      await fetch(
        `${API_URL}/expenses/${id}`,

        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


    if (
      response.status === 401 ||
      response.status === 403
    ) {

      logout();

      return;
    }


    if (editingId === id) {
      resetForm();
    }


    fetchExpenses();
  }


  // ========================================
  // RESET FORM
  // ========================================

  function resetForm() {

    setTitle("");

    setAmount("");

    setCategory("Food");

    setExpenseDate("");

    setEditingId(null);
  }


  // ========================================
  // TOTAL
  // ========================================

  const totalSpent =
    expenses.reduce(
      (
        total,
        expense
      ) =>

        total +
        Number(
          expense.amount
        ),

      0
    );


  // ========================================
  // LOGIN / REGISTER PAGE
  // ========================================

  if (!token) {

    return (

      <div className="auth-page">

        <div className="auth-card">

          <h1>
            Expense Dashboard
          </h1>


          <p>

            {authMode === "login"

              ? "Login to your account"

              : "Create a new account"}

          </p>


          <form
            onSubmit={
              authMode === "login"

                ? loginUser

                : registerUser
            }
          >

            {authMode ===
              "register" && (

              <input
                type="text"

                placeholder={
                  "Your name"
                }

                value={name}

                onChange={
                  (event) =>
                    setName(
                      event.target.value
                    )
                }

                required
              />

            )}


            <input
              type="email"

              placeholder="Email"

              value={email}

              onChange={
                (event) =>
                  setEmail(
                    event.target.value
                  )
              }

              required
            />


            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }

              placeholder="Password"

              value={password}

              onChange={
                (event) =>
                  setPassword(
                    event.target.value
                  )
              }

              required
            />


            <label
              className={
                "show-password"
              }
            >

              <input
                type="checkbox"

                checked={
                  showPassword
                }

                onChange={
                  (event) =>
                    setShowPassword(
                      event.target
                        .checked
                    )
                }
              />

              Show password

            </label>


            <button
              type="submit"
            >

              {authMode ===
              "login"

                ? "Login"

                : "Register"}

            </button>

          </form>


          {authError && (

            <p className="error">

              {authError}

            </p>

          )}


          {authMessage && (

            <p className="success">

              {authMessage}

            </p>

          )}


          {authMode === "login"

            ? (

              <p>

                Don't have an
                account?{" "}

                <button
                  type="button"

                  className={
                    "text-button"
                  }

                  onClick={() => {

                    setAuthMode(
                      "register"
                    );

                    setAuthError("");

                    setAuthMessage("");

                  }}
                >

                  Register

                </button>

              </p>

            )

            : (

              <p>

                Already have an
                account?{" "}

                <button
                  type="button"

                  className={
                    "text-button"
                  }

                  onClick={() => {

                    setAuthMode(
                      "login"
                    );

                    setAuthError("");

                    setAuthMessage("");

                  }}
                >

                  Login

                </button>

              </p>

            )}

        </div>

      </div>
    );
  }


  // ========================================
  // DASHBOARD
  // ========================================

  return (

    <div className="container">

      <div className="header">

        <div>

          <h1>
            Expense Dashboard
          </h1>

          <p>
            Track and manage
            your spending.
          </p>

        </div>


        <button
          onClick={logout}
        >
          Logout
        </button>

      </div>


      <div className="dashboard">

        <div className="card">

          <h3>
            Total Expenses
          </h3>

          <h2>
            {expenses.length}
          </h2>

        </div>


        <div className="card">

          <h3>
            Total Spent
          </h3>

          <h2>

            £
            {totalSpent.toFixed(
              2
            )}

          </h2>

        </div>

      </div>


      <h2>

        {editingId === null

          ? "Add Expense"

          : "Edit Expense"}

      </h2>


      <form
        onSubmit={
          saveExpense
        }
      >

        <input
          type="text"

          placeholder={
            "Expense title"
          }

          value={title}

          onChange={
            (event) =>
              setTitle(
                event.target.value
              )
          }

          required
        />


        <input
          type="number"

          step="0.01"

          min="0"

          placeholder="Amount"

          value={amount}

          onChange={
            (event) =>
              setAmount(
                event.target.value
              )
          }

          required
        />


        <select
          value={category}

          onChange={
            (event) =>
              setCategory(
                event.target.value
              )
          }
        >

          <option>
            Food
          </option>

          <option>
            Transport
          </option>

          <option>
            Shopping
          </option>

          <option>
            Bills
          </option>

          <option>
            Entertainment
          </option>

          <option>
            Other
          </option>

        </select>


        <input
          type="date"

          value={
            expenseDate
          }

          onChange={
            (event) =>
              setExpenseDate(
                event.target.value
              )
          }

          required
        />


        <button
          type="submit"
        >

          {editingId === null

            ? "Add Expense"

            : "Update Expense"}

        </button>


        {editingId !== null && (

          <button
            type="button"

            onClick={
              resetForm
            }
          >
            Cancel
          </button>

        )}

      </form>


      <h2>
        Recent Expenses
      </h2>


      <div
        className={
          "expense-list"
        }
      >

        {expenses.length === 0 && (

          <p>
            No expenses yet.
          </p>

        )}


        {expenses.map(
          (expense) => (

            <div
              className={
                "expense-card"
              }

              key={
                expense.id
              }
            >

              <div>

                <h3>
                  {expense.title}
                </h3>

                <p>

                  {expense.category}

                  {" · "}

                  {
                    expense.expense_date
                  }

                </p>

              </div>


              <div
                className={
                  "expense-actions"
                }
              >

                <strong>

                  £
                  {Number(
                    expense.amount
                  ).toFixed(2)}

                </strong>


                <button
                  onClick={() =>
                    editExpense(
                      expense
                    )
                  }
                >
                  Edit
                </button>


                <button
                  className={
                    "delete-button"
                  }

                  onClick={() =>
                    deleteExpense(
                      expense.id
                    )
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          )
        )}

      </div>


      {/* FLOATING AI CHATBOT */}

      <Chatbot
        token={token}
      />

    </div>
  );
}


export default App;