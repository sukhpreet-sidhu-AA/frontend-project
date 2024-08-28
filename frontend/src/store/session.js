import { csrfFetch } from "./csrf";

const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

const setUser = (user) => {
    return {
        type: SET_USER,
        user
    }
}

const removeUser = () => {
    return {
        type: REMOVE_USER,
    }
}

export const login = (login) => async (dispatch) => {
    const { credential, password } = login;
    const res = await csrfFetch('/api/session', {
        method:'POST',
        body: JSON.stringify({
            credential,
            password
          })
    })
    const data = await res.json();
    dispatch(setUser(data.user));
    return res;
}


const sessionReducer = (state = {user: null}, action) => {
    switch(action.type){
        case SET_USER:
            return { ...state, user: action.user };
        
        case REMOVE_USER: 
            return { ...state, user: null };
        
        default:
            return state;
    }
}

export default sessionReducer