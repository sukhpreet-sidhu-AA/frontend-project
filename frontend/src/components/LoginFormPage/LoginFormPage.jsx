import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { login } from "../../store/session";
import { Navigate } from "react-router-dom";
import './LoginForm.css'

const LoginFormPage = () => {
    const dispatch = useDispatch();
    const sessionUser = useSelector((state) => state.session.user)
    const [credential, setCredential] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})

    if (sessionUser) return <Navigate to='/' replace={true} />

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        return dispatch(login({ credential, password })).catch(
            async (res) => {
                const data = await res.json()
                if (data?.message) setErrors(data)
            }
        )
    }

    return (
        <>
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-box">
                    <label>
                        Username or Email:
                        <input value={credential}
                            autoComplete="username"
                            type="text"
                            onChange={(e) => setCredential(e.target.value)} />
                    </label>

                    <label>
                        Password:
                        <input value={password}
                            autoComplete="current-password"
                            type="password"
                            onChange={(e) => setPassword(e.target.value)} />
                    </label>
                    {errors.message && <p className="error">{errors.message}</p>}
                    <button type="submit">Login</button>
                </div>

            </form>
        </>

    )

}

export default LoginFormPage