from fastapi import (
    FastAPI,
    HTTPException,
    Depends
)

from fastapi.middleware.cors import CORSMiddleware

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from pydantic import BaseModel

from database import get_connection

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_user_id_from_token
)


# ==========================================
# CREATE FASTAPI APP
# ==========================================

app = FastAPI()


# ==========================================
# CORS
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# JWT SECURITY
# ==========================================

security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials
    = Depends(security)
):

    token = credentials.credentials

    user_id = get_user_id_from_token(token)

    if user_id is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return user_id


# ==========================================
# PYDANTIC MODELS
# ==========================================

class ExpenseCreate(BaseModel):

    title: str
    amount: float
    category: str
    expense_date: str


class UserRegister(BaseModel):

    name: str
    email: str
    password: str


class UserLogin(BaseModel):

    email: str
    password: str


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Expense Dashboard API is running"
    }


# ==========================================
# REGISTER
# ==========================================

@app.post("/register", status_code=201)
def register_user(user: UserRegister):

    connection = get_connection()

    try:
        email = user.email.strip().lower()

        existing_user = connection.execute(
            """
            SELECT id
            FROM users
            WHERE email = %s
            """,
            (email,)
        ).fetchone()

        if existing_user is not None:

            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        hashed_password = hash_password(
            user.password
        )

        cursor = connection.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                hashed_password
            )
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (
                user.name,
                email,
                hashed_password
            )
        )

        new_user_id = cursor.fetchone()[0]

        connection.commit()

        return {
            "id": new_user_id,
            "name": user.name,
            "email": email
        }

    finally:

        connection.close()


# ==========================================
# LOGIN
# ==========================================

@app.post("/login")
def login_user(user: UserLogin):

    connection = get_connection()

    try:
        email = user.email.strip().lower()

        existing_user = connection.execute(
            """
            SELECT id, email, hashed_password
            FROM users
            WHERE LOWER(email) = %s
            """,
            (email,)
        ).fetchone()

        print("LOGIN EMAIL:", email)
        print("USER FOUND:", existing_user is not None)

        if existing_user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        user_id = existing_user[0]
        hashed_password = existing_user[2]

        password_correct = verify_password(
            user.password,
            hashed_password
        )

        print("PASSWORD CORRECT:", password_correct)

        if not password_correct:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        token = create_access_token(user_id)

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    finally:
        connection.close()


# ==========================================
# GET EXPENSES
# ==========================================

@app.get("/expenses")
def get_expenses(
    user_id: int = Depends(
        get_current_user_id
    )
):

    connection = get_connection()

    try:

        cursor = connection.execute(
            """
            SELECT
                id,
                title,
                amount,
                category,
                expense_date
            FROM expenses
            WHERE user_id = %s
            ORDER BY id DESC
            """,
            (user_id,)
        )

        rows = cursor.fetchall()

        return [
            {
                "id": row[0],
                "title": row[1],
                "amount": float(row[2]),
                "category": row[3],
                "expense_date": row[4]
            }
            for row in rows
        ]

    finally:

        connection.close()


# ==========================================
# ADD EXPENSE
# ==========================================

@app.post(
    "/expenses",
    status_code=201
)
def add_expense(
    expense: ExpenseCreate,

    user_id: int = Depends(
        get_current_user_id
    )
):

    connection = get_connection()

    try:

        cursor = connection.execute(
            """
            INSERT INTO expenses
            (
                title,
                amount,
                category,
                expense_date,
                user_id
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                expense.title,
                expense.amount,
                expense.category,
                expense.expense_date,
                user_id
            )
        )

        new_id = cursor.fetchone()[0]

        connection.commit()

        return {
            "id": new_id,
            "title": expense.title,
            "amount": expense.amount,
            "category": expense.category,
            "expense_date": expense.expense_date
        }

    finally:

        connection.close()


# ==========================================
# UPDATE EXPENSE
# ==========================================

@app.put("/expenses/{expense_id}")
def update_expense(
    expense_id: int,

    expense: ExpenseCreate,

    user_id: int = Depends(
        get_current_user_id
    )
):

    connection = get_connection()

    try:

        existing_expense = connection.execute(
            """
            SELECT id
            FROM expenses

            WHERE id = %s
            AND user_id = %s
            """,
            (
                expense_id,
                user_id
            )
        ).fetchone()

        if existing_expense is None:

            raise HTTPException(
                status_code=404,
                detail="Expense not found"
            )

        connection.execute(
            """
            UPDATE expenses

            SET
                title = %s,
                amount = %s,
                category = %s,
                expense_date = %s

            WHERE id = %s
            AND user_id = %s
            """,
            (
                expense.title,
                expense.amount,
                expense.category,
                expense.expense_date,
                expense_id,
                user_id
            )
        )

        connection.commit()

        return {
            "id": expense_id,
            "title": expense.title,
            "amount": expense.amount,
            "category": expense.category,
            "expense_date": expense.expense_date
        }

    finally:

        connection.close()


# ==========================================
# DELETE EXPENSE
# ==========================================

@app.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,

    user_id: int = Depends(
        get_current_user_id
    )
):

    connection = get_connection()

    try:

        cursor = connection.execute(
            """
            DELETE FROM expenses

            WHERE id = %s
            AND user_id = %s
            """,
            (
                expense_id,
                user_id
            )
        )

        connection.commit()

        if cursor.rowcount == 0:

            raise HTTPException(
                status_code=404,
                detail="Expense not found"
            )

        return {
            "message":
                "Expense deleted successfully"
        }

    finally:

        connection.close()